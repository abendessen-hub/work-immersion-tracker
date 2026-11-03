import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSession, isPositiveInteger, sql } from "./_lib.js";

const MAX_GPS_UNCERTAINTY_BUFFER_METERS = 20;

function optionalDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }
  return value;
}

function optionalId(value: unknown): number | null | undefined {
  if (value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return isPositiveInteger(parsed) ? parsed : undefined;
}

function validCoordinate(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function distanceInMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(latitude2 - latitude1);
  const longitudeDelta = radians(longitude2 - longitude1);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude1)) *
      Math.cos(radians(latitude2)) *
      Math.sin(longitudeDelta / 2) ** 2;
  const clampedHaversine = Math.min(1, Math.max(0, haversine));
  return (
    6_371_000 *
    2 *
    Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine))
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in first" });

  if (req.method === "GET") {
    const date = optionalDate(req.query.date);
    const sectionId = optionalId(req.query.sectionId);
    const companyId = optionalId(req.query.companyId);
    if (date === undefined) {
      return res.status(400).json({ error: "Use valid YYYY-MM-DD dates" });
    }
    if (sectionId === undefined || companyId === undefined) {
      return res
        .status(400)
        .json({ error: "Invalid section or company filter" });
    }
    const includeAbsences =
      date !== null && sectionId !== null && companyId !== null;

    try {
      const records =
        session.accessId === 1
          ? await sql`
            SELECT a.user_id, u.full_name,
                   s.section_name, c.company_name,
                   a.date, a.time_in, a.time_out,
                   CASE
                     WHEN a.time_out IS NULL THEN 'No Time Out'
                     ELSE 'Attended'
                   END AS status
            FROM attendance_record a
            JOIN users u ON u.user_id = a.user_id
              LEFT JOIN section_reference s ON s.section_id = u.section_id
              LEFT JOIN company_reference c ON c.company_id = u.company_id
            WHERE a.user_id = ${session.userId}
              AND (${date}::date IS NULL OR a.date = ${date}::date)
            ORDER BY a.date DESC, a.time_in DESC
            LIMIT 5000
          `
          : await sql`
           SELECT u.user_id, u.full_name,
                  s.section_name, c.company_name,
                  CASE
                    WHEN a.record_id IS NULL THEN ${date}::date
                    ELSE a.date
                  END AS date,
                  a.time_in, a.time_out,
                  CASE
                      WHEN a.record_id IS NULL THEN 'Absent'
                      WHEN a.time_out IS NULL THEN 'No Time Out'
                      ELSE 'Attended'
                  END AS status
          FROM users u
          LEFT JOIN attendance_record a
            ON u.user_id = a.user_id
              AND (
                (${includeAbsences}::boolean AND a.date = ${date}::date)
                OR (
                  NOT ${includeAbsences}::boolean
                  AND (${date}::date IS NULL OR a.date = ${date}::date)
                )
              )
          LEFT JOIN section_reference s ON s.section_id = u.section_id
          LEFT JOIN company_reference c ON c.company_id = u.company_id
          WHERE (${sectionId}::int IS NULL OR u.section_id = ${sectionId})
            AND (${companyId}::int IS NULL OR u.company_id = ${companyId})
            AND (${includeAbsences}::boolean OR a.record_id IS NOT NULL)
            AND (u.access_id = 1)
          ORDER BY a.date DESC, a.time_in DESC
          LIMIT 5000
          `;

      return res.status(200).json({ records });
    } catch (error) {
      console.error("Attendance query failed:", error);
      return res
        .status(500)
        .json({ error: "Attendance records could not be loaded" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (session.accessId !== 1) {
    return res
      .status(403)
      .json({ error: "Only student accounts can check in" });
  }

  const companyId = req.body?.companyId;
  if (!isPositiveInteger(companyId)) {
    return res.status(400).json({ error: "Invalid company QR code" });
  }
  const location = req.body?.location;
  if (
    typeof location !== "object" ||
    location === null ||
    !validCoordinate(location.latitude, -90, 90) ||
    !validCoordinate(location.longitude, -180, 180) ||
    typeof location.accuracy !== "number" ||
    !Number.isFinite(location.accuracy) ||
    location.accuracy < 0
  ) {
    return res
      .status(400)
      .json({ error: "A valid device location is required" });
  }

  try {
    const users = await sql`
      SELECT u.user_id, u.username, u.access_id, u.section_id, u.company_id
      FROM users u
      WHERE u.user_id = ${session.userId}
    `;
    const user = users[0];
    if (!user || Number(user.access_id) !== 1) {
      return res
        .status(403)
        .json({ error: "Student account is no longer active" });
    }
    const locationTestMode =
      String(user.username).toLowerCase() === "1059student" &&
      Number(user.section_id) === 1059 &&
      Number(user.company_id) === 1059;
    if (!locationTestMode && Number(user.company_id) !== companyId) {
      return res.status(403).json({
        error: "This company QR does not match your assigned company",
      });
    }

    const companies = await sql`
      SELECT company_id, company_name, latitude, longitude, radius_meters
      FROM company_reference
      WHERE company_id = ${locationTestMode ? companyId : user.company_id}
      LIMIT 1
    `;
    const company = companies[0];
    if (!company) {
      return res.status(400).json({ error: "Company QR code was not found" });
    }

    const latitude = Number(company.latitude);
    const longitude = Number(company.longitude);
    const radiusMeters = Number(company.radius_meters);
    if (
      company.latitude == null ||
      company.longitude == null ||
      !validCoordinate(latitude, -90, 90) ||
      !validCoordinate(longitude, -180, 180) ||
      !Number.isFinite(radiusMeters) ||
      radiusMeters <= 0
    ) {
      return res.status(409).json({
        error:
          "This company has no valid check-in location. Contact an administrator.",
      });
    }

    const distance = distanceInMeters(
      location.latitude,
      location.longitude,
      latitude,
      longitude,
    );
    const accuracyBufferMeters = Math.min(
      location.accuracy,
      MAX_GPS_UNCERTAINTY_BUFFER_METERS,
    );
    const allowedDistanceMeters = radiusMeters + accuracyBufferMeters;
    if (distance > allowedDistanceMeters) {
      return res.status(403).json({
        error: `You are outside your company check-in area (${Math.ceil(distance)} m away; check-in limit for this GPS fix is ${Math.ceil(allowedDistanceMeters)} m).`,
      });
    }

    if (locationTestMode) {
      return res.status(200).json({
        testOnly: true,
        companyName: company.company_name,
        distanceMeters: Math.ceil(distance),
        radiusMeters,
        allowedDistanceMeters: Math.ceil(allowedDistanceMeters),
        locationPassed: true,
        attendanceRecorded: false,
      });
    }

    if (!user.section_id || !user.company_id) {
      return res
        .status(400)
        .json({ error: "Your account has no assigned section or company" });
    }

    const [, result] = await sql.transaction([
      sql`
        SELECT pg_advisory_xact_lock(
          hashtext(${String(user.user_id)}),
          hashtext((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date::text)
        )
      `,
      sql`
        WITH existing AS MATERIALIZED (
          SELECT a.record_id, a.time_out
          FROM attendance_record a
          WHERE a.user_id = ${user.user_id}
            AND a.date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date
          ORDER BY a.record_id DESC
          LIMIT 1
          FOR UPDATE
        ),
        inserted AS (
          INSERT INTO attendance_record (user_id, date, time_in)
          SELECT
            ${user.user_id},
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date,
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::time
          WHERE NOT EXISTS (SELECT 1 FROM existing)
          RETURNING record_id, date, time_in, time_out
        ),
        updated AS (
          UPDATE attendance_record
          SET time_out = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::time
          WHERE record_id = (
            SELECT record_id FROM existing WHERE time_out IS NULL
          )
          RETURNING record_id, date, time_in, time_out
        )
        SELECT 'time-in' AS action, record_id, date, time_in, time_out FROM inserted
        UNION ALL
        SELECT 'time-out' AS action, record_id, date, time_in, time_out FROM updated
      `,
    ]);
    if (result.length) {
      return res.status(result[0].action === "time-in" ? 201 : 200).json({
        action: result[0].action,
        record: result[0],
      });
    }

    return res.status(409).json({
      error: "Your attendance is already complete for today",
    });
  } catch (error) {
    console.error("Attendance check-in failed:", error);
    return res.status(500).json({ error: "Attendance could not be recorded" });
  }
}
