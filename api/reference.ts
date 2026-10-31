import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSession, isPositiveInteger, sql } from "./_lib.js";

type RequestBody = Record<string, unknown>;

type CompanyInput = {
  companyName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

type SectionInput = {
  sectionName: string;
  companyId: number | null;
};

function requestBody(value: unknown): RequestBody {
  return typeof value === "object" && value !== null
    ? (value as RequestBody)
    : {};
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length > 0 && name.length <= 160 ? name : null;
}

function companyInput(body: RequestBody): CompanyInput | null {
  const companyName = cleanName(body.companyName);
  const { latitude, longitude, radiusMeters } = body;
  if (
    !companyName ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    typeof radiusMeters !== "number" ||
    !Number.isSafeInteger(radiusMeters) ||
    radiusMeters < 1 ||
    radiusMeters > 50000
  ) {
    return null;
  }
  return { companyName, latitude, longitude, radiusMeters };
}

function sectionInput(body: RequestBody): SectionInput | null {
  const sectionName = cleanName(body.sectionName);
  const companyId = body.companyId;
  if (
    !sectionName ||
    (companyId !== null && !isPositiveInteger(companyId))
  ) {
    return null;
  }
  return { sectionName, companyId };
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503"
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in first" });
  if (session.accessId !== 3) {
    return res.status(403).json({ error: "Admin access is required" });
  }

  if (req.method === "GET") {
    try {
      const [companies, accessReferences, sections] = await Promise.all([
        sql`
          SELECT company_id, company_name, latitude, longitude, radius_meters
          FROM company_reference
          ORDER BY company_name
        `,
        sql`
          SELECT access_id, access_name
          FROM access_reference
          ORDER BY access_id
        `,
        sql`
          SELECT
            s.section_id, s.section_name, s.company_id, s.teacher_id,
            c.company_name, t.teacher_name
          FROM section_reference s
          LEFT JOIN company_reference c ON c.company_id = s.company_id
          LEFT JOIN immersion_teacher t ON t.teacher_id = s.teacher_id
          ORDER BY s.section_name
        `,
      ]);
      return res.status(200).json({ companies, accessReferences, sections });
    } catch (error) {
      console.error("Could not load references:", error);
      return res.status(500).json({ error: "Could not load references" });
    }
  }

  if (
    req.method !== "POST" &&
    req.method !== "PUT" &&
    req.method !== "DELETE"
  ) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = requestBody(req.body);
  const referenceType = body.referenceType;

  try {
    if (referenceType === "company") {
      if (req.method === "DELETE") {
        const companyId = body.companyId;
        if (!isPositiveInteger(companyId)) {
          return res.status(400).json({ error: "Invalid company reference" });
        }
        const deleted = await sql`
          DELETE FROM company_reference
          WHERE company_id = ${companyId}
          RETURNING company_id
        `;
        if (!deleted.length) {
          return res.status(404).json({ error: "Company reference not found" });
        }
        return res.status(200).json({ deleted: companyId });
      }

      const input = companyInput(body);
      if (!input) {
        return res.status(400).json({
          error:
            "Enter a company name, valid coordinates, and a radius from 1 to 50,000 meters",
        });
      }

      const companyId = body.companyId;
      if (req.method === "PUT" && !isPositiveInteger(companyId)) {
        return res.status(400).json({ error: "Invalid company reference" });
      }

      const duplicate = await sql`
        SELECT company_id
        FROM company_reference
        WHERE lower(btrim(company_name)) = lower(${input.companyName})
          AND company_id <> ${req.method === "PUT" ? companyId : 0}
        LIMIT 1
      `;
      if (duplicate.length) {
        return res.status(409).json({
          error: "A company with that name already exists",
        });
      }

      if (req.method === "POST") {
        const created = await sql`
          INSERT INTO company_reference
            (company_name, latitude, longitude, radius_meters)
          VALUES
            (${input.companyName}, ${input.latitude}, ${input.longitude}, ${input.radiusMeters})
          RETURNING company_id, company_name, latitude, longitude, radius_meters
        `;
        return res.status(201).json({ company: created[0] });
      }

      const updated = await sql`
        UPDATE company_reference
        SET company_name = ${input.companyName},
            latitude = ${input.latitude},
            longitude = ${input.longitude},
            radius_meters = ${input.radiusMeters}
        WHERE company_id = ${companyId}
        RETURNING company_id, company_name, latitude, longitude, radius_meters
      `;
      if (!updated.length) {
        return res.status(404).json({ error: "Company reference not found" });
      }
      return res.status(200).json({ company: updated[0] });
    }

    if (referenceType === "access") {
      const accessId = body.accessId;
      if (
        (req.method === "PUT" || req.method === "DELETE") &&
        !isPositiveInteger(accessId)
      ) {
        return res.status(400).json({ error: "Invalid access reference" });
      }
      if (
        (req.method === "PUT" || req.method === "DELETE") &&
        Number(accessId) <= 3
      ) {
        return res.status(403).json({
          error: "The built-in student, teacher, and admin roles cannot be changed or deleted",
        });
      }

      if (req.method === "DELETE") {
        const deleted = await sql`
          DELETE FROM access_reference
          WHERE access_id = ${accessId}
          RETURNING access_id
        `;
        if (!deleted.length) {
          return res.status(404).json({ error: "Access reference not found" });
        }
        return res.status(200).json({ deleted: accessId });
      }

      const accessName = cleanName(body.accessName);
      if (!accessName) {
        return res.status(400).json({
          error: "Access reference name must be between 1 and 160 characters",
        });
      }

      const duplicate = await sql`
        SELECT access_id
        FROM access_reference
        WHERE lower(btrim(access_name)) = lower(${accessName})
          AND access_id <> ${req.method === "PUT" ? accessId : 0}
        LIMIT 1
      `;
      if (duplicate.length) {
        return res.status(409).json({
          error: "An access reference with that name already exists",
        });
      }

      if (req.method === "POST") {
        const created = await sql`
          INSERT INTO access_reference (access_name)
          VALUES (${accessName})
          RETURNING access_id, access_name
        `;
        return res.status(201).json({ accessReference: created[0] });
      }

      const updated = await sql`
        UPDATE access_reference
        SET access_name = ${accessName}
        WHERE access_id = ${accessId}
        RETURNING access_id, access_name
      `;
      if (!updated.length) {
        return res.status(404).json({ error: "Access reference not found" });
      }
      return res.status(200).json({ accessReference: updated[0] });
    }

    if (referenceType === "section") {
      if (req.method === "DELETE") {
        const sectionId = body.sectionId;
        if (!isPositiveInteger(sectionId)) {
          return res.status(400).json({ error: "Invalid section reference" });
        }
        const deleted = await sql`
          DELETE FROM section_reference
          WHERE section_id = ${sectionId}
          RETURNING section_id
        `;
        if (!deleted.length) {
          return res.status(404).json({ error: "Section reference not found" });
        }
        return res.status(200).json({ deleted: sectionId });
      }

      const input = sectionInput(body);
      if (!input) {
        return res.status(400).json({
          error: "Enter a section name and select a valid company or no company",
        });
      }
      const sectionId = body.sectionId;
      if (req.method === "PUT" && !isPositiveInteger(sectionId)) {
        return res.status(400).json({ error: "Invalid section reference" });
      }

      if (input.companyId !== null) {
        const company = await sql`
          SELECT company_id
          FROM company_reference
          WHERE company_id = ${input.companyId}
        `;
        if (!company.length) {
          return res.status(400).json({ error: "Selected company was not found" });
        }
      }

      const duplicate = await sql`
        SELECT section_id
        FROM section_reference
        WHERE lower(btrim(section_name)) = lower(${input.sectionName})
          AND section_id <> ${req.method === "PUT" ? sectionId : 0}
        LIMIT 1
      `;
      if (duplicate.length) {
        return res.status(409).json({
          error: "A section with that name already exists",
        });
      }

      if (req.method === "POST") {
        const created = await sql`
          INSERT INTO section_reference (section_name, company_id)
          VALUES (${input.sectionName}, ${input.companyId})
          RETURNING section_id, section_name, company_id, teacher_id
        `;
        return res.status(201).json({ section: created[0] });
      }

      const updated = await sql`
        UPDATE section_reference
        SET section_name = ${input.sectionName},
            company_id = ${input.companyId}
        WHERE section_id = ${sectionId}
        RETURNING section_id, section_name, company_id, teacher_id
      `;
      if (!updated.length) {
        return res.status(404).json({ error: "Section reference not found" });
      }
      return res.status(200).json({ section: updated[0] });
    }

    return res.status(400).json({ error: "Invalid reference type" });
  } catch (error) {
    console.error("Could not update references:", error);
    if (isForeignKeyViolation(error)) {
      return res.status(409).json({
        error:
          "This reference is assigned to existing accounts or sections and cannot be deleted",
      });
    }
    return res.status(500).json({ error: "Could not update references" });
  }
}
