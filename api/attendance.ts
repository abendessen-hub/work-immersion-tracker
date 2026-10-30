import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSession, isPositiveInteger, sql } from "./_lib.js";

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

    try {
      const records =
        session.accessId === 1
          ? await sql`
            SELECT a.user_id, u.full_name,
                   s.section_name, c.company_name,
                   a.date, a.time_in, a.time_out
            FROM attendance_record a
            JOIN users u ON u.user_id = a.user_id
            JOIN section_reference s ON s.section_id = u.section_id
            JOIN company_reference c ON c.company_id = u.company_id
            WHERE a.user_id = ${session.userId}
              AND (${date}::date IS NULL OR a.date >= ${date}::date)
            ORDER BY a.date DESC, a.time_in DESC
            LIMIT 5000
          `
          : await sql`
           SELECT u.user_id, u.full_name,
                  s.section_name, c.company_name,
                  a.date, a.time_in, a.time_out,
                  CASE
                      WHEN a.record_id IS NULL THEN 'Absent'
                      WHEN a.time_out IS NULL THEN 'No Time Out'
                      ELSE 'Attended'
                  END AS status
          FROM users u
          LEFT JOIN attendance_record a ON u.user_id = a.user_id
          LEFT JOIN section_reference s ON s.section_id = u.section_id
          LEFT JOIN company_reference c ON c.company_id = u.company_id
          WHERE (${sectionId}::int IS NULL OR u.section_id = ${sectionId})
            AND (${companyId}::int IS NULL OR u.company_id = ${companyId})
            AND (${date}::date IS NULL OR a.date >= ${date}::date OR a.date IS NULL)
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

  try {
    // student attedance
    const users = await sql`
      SELECT u.user_id, u.access_id, u.section_id,
             COALESCE(u.company_id, s.company_id) AS company_id
      FROM users u
      LEFT JOIN section_reference s ON s.section_id = u.section_id
      WHERE u.user_id = ${session.userId}
    `;
    const user = users[0];
    if (!user || Number(user.access_id) !== 1) {
      return res
        .status(403)
        .json({ error: "Student account is no longer active" });
    }
    if (Number(user.company_id) !== companyId) {
      return res.status(403).json({
        error: "This company QR does not match your assigned company",
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
