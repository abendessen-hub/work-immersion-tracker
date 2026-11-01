import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { getSession, isPositiveInteger, sql } from "./_lib.js";

const pageSize = 20;

function queryValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function positiveId(value: unknown): number | null {
  if (typeof value !== "number" || !isPositiveInteger(value)) return null;
  return value;
}

function nullableId(value: unknown): number | null | undefined {
  if (value === null || value === "") return null;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  return isPositiveInteger(parsed) ? parsed : undefined;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isAdmin(sessionAccessId: number) {
  return sessionAccessId === 3;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in first" });
  if (!isAdmin(session.accessId)) {
    return res.status(403).json({ error: "Admin access is required" });
  }

  if (req.method === "GET") {
    const rawPage = Number(queryValue(req.query.page) || "1");
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const searchTerm = queryValue(req.query.search).trim();
    const offset = (page - 1) * pageSize;
    try {
      const filter = `%${searchTerm}%`;
      const [accounts, totals] = await Promise.all([
        sql`
          SELECT
            u.user_id, u.username, u.full_name, u.access_id,
            u.section_id, s.section_name, u.company_id, c.company_name,
            u.contact_number, u."changedPassword", a.access_name
          FROM users u
          LEFT JOIN section_reference s ON s.section_id = u.section_id
          LEFT JOIN company_reference c ON c.company_id = u.company_id
          LEFT JOIN access_reference a ON a.access_id = u.access_id
          WHERE ${searchTerm} = ''
             OR u.username ILIKE ${filter}
             OR u.full_name ILIKE ${filter}
             OR COALESCE(u.contact_number, '') ILIKE ${filter}
             OR COALESCE(s.section_name, '') ILIKE ${filter}
             OR COALESCE(c.company_name, '') ILIKE ${filter}
             OR COALESCE(a.access_name, '') ILIKE ${filter}
          ORDER BY u.full_name, u.user_id
          LIMIT ${pageSize} OFFSET ${offset}
        `,
        sql`
          SELECT COUNT(*)::int AS total
          FROM users u
          LEFT JOIN section_reference s ON s.section_id = u.section_id
          LEFT JOIN company_reference c ON c.company_id = u.company_id
          LEFT JOIN access_reference a ON a.access_id = u.access_id
          WHERE ${searchTerm} = ''
             OR u.username ILIKE ${filter}
             OR u.full_name ILIKE ${filter}
             OR COALESCE(u.contact_number, '') ILIKE ${filter}
             OR COALESCE(s.section_name, '') ILIKE ${filter}
             OR COALESCE(c.company_name, '') ILIKE ${filter}
             OR COALESCE(a.access_name, '') ILIKE ${filter}
        `,
      ]);
      const total = Number(totals[0]?.total ?? 0);
      return res.status(200).json({
        accounts,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      console.error("Could not load accounts:", error);
      return res.status(500).json({ error: "Accounts could not be loaded" });
    }
  }

  const body =
    typeof req.body === "object" && req.body !== null ? req.body : {};

  if (req.method === "POST") {
    const fullName = cleanText(body.fullName);
    const username = cleanText(body.username).toLocaleLowerCase();
    const sectionName = cleanText(body.section);
    const companyName = cleanText(body.company);
    const contactNumber = cleanText(body.contactNumber);
    const password = typeof body.password === "string" ? body.password : "";
    const accessId = positiveId(body.accessId);
    const changedPassword =
      typeof body.changedPassword === "boolean" ? body.changedPassword : null;

    if (
      !fullName ||
      !username ||
      !sectionName ||
      !companyName ||
      !contactNumber ||
      !password ||
      !accessId ||
      changedPassword === null
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    try {
      const [section, company, access] = await Promise.all([
        sql`SELECT section_id FROM section_reference WHERE lower(section_name) = lower(${sectionName}) LIMIT 1`,
        sql`SELECT company_id FROM company_reference WHERE lower(company_name) = lower(${companyName}) LIMIT 1`,
        sql`SELECT access_id FROM access_reference WHERE access_id = ${accessId}`,
      ]);
      if (!section.length) {
        return res
          .status(400)
          .json({ error: `Section "${sectionName}" was not found.` });
      }
      if (!company.length) {
        return res
          .status(400)
          .json({ error: `Company "${companyName}" was not found.` });
      }
      if (!access.length) {
        return res
          .status(400)
          .json({ error: "Selected access reference was not found." });
      }

      const existing =
        await sql`SELECT user_id FROM users WHERE lower(username) = ${username} LIMIT 1`;
      if (existing.length) {
        return res
          .status(409)
          .json({ error: "That username is already in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const created = await sql`
        INSERT INTO users
          (username, full_name, password, access_id, section_id, company_id, "changedPassword", contact_number)
        VALUES
          (${username}, ${fullName}, ${passwordHash}, ${accessId}, ${section[0].section_id}, ${company[0].company_id}, ${changedPassword}, ${contactNumber})
        RETURNING user_id, username, full_name, access_id
      `;
      return res.status(201).json({ user: created[0] });
    } catch (error) {
      console.error("Account creation failed:", error);
      return res.status(500).json({ error: "Account could not be created" });
    }
  }

  if (req.method === "PUT") {
    const userId = positiveId(body.userId);
    const fullName = cleanText(body.fullName);
    const username = cleanText(body.username).toLocaleLowerCase();
    const contactNumber = cleanText(body.contactNumber);
    const accessId = positiveId(body.accessId);
    const sectionId = nullableId(body.sectionId);
    const companyId = nullableId(body.companyId);
    const changedPassword =
      typeof body.changedPassword === "boolean" ? body.changedPassword : null;
    const password = typeof body.password === "string" ? body.password : "";

    if (
      !userId ||
      !fullName ||
      !username ||
      !contactNumber ||
      !accessId ||
      changedPassword === null ||
      sectionId === undefined ||
      companyId === undefined
    ) {
      return res.status(400).json({ error: "Enter valid account details" });
    }
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    try {
      const [duplicate, access, section, company] = await Promise.all([
        sql`
          SELECT user_id FROM users
          WHERE lower(username) = ${username} AND user_id <> ${userId}
          LIMIT 1
        `,
        sql`SELECT access_id FROM access_reference WHERE access_id = ${accessId}`,
        sectionId === null
          ? Promise.resolve([])
          : sql`SELECT section_id FROM section_reference WHERE section_id = ${sectionId}`,
        companyId === null
          ? Promise.resolve([])
          : sql`SELECT company_id FROM company_reference WHERE company_id = ${companyId}`,
      ]);
      if (duplicate.length) {
        return res
          .status(409)
          .json({ error: "That username is already in use" });
      }
      if (!access.length) {
        return res
          .status(400)
          .json({ error: "Selected access reference was not found." });
      }
      if (sectionId !== null && !section.length) {
        return res
          .status(400)
          .json({ error: "Selected section was not found." });
      }
      if (companyId !== null && !company.length) {
        return res
          .status(400)
          .json({ error: "Selected company was not found." });
      }

      const updated = password
        ? await sql`
            UPDATE users
            SET username = ${username}, full_name = ${fullName},
                access_id = ${accessId}, section_id = ${sectionId},
                company_id = ${companyId}, contact_number = ${contactNumber},
                password = ${await bcrypt.hash(password, 10)},
                "changedPassword" = false
            WHERE user_id = ${userId}
            RETURNING user_id, username, full_name, access_id
          `
        : await sql`
            UPDATE users
            SET username = ${username}, full_name = ${fullName},
                access_id = ${accessId}, section_id = ${sectionId},
                company_id = ${companyId}, contact_number = ${contactNumber}
            WHERE user_id = ${userId}
            RETURNING user_id, username, full_name, access_id
          `;
      if (!updated.length) {
        return res.status(404).json({ error: "Account not found" });
      }
      return res.status(200).json({ user: updated[0] });
    } catch (error) {
      console.error("Account update failed:", error);
      return res.status(500).json({ error: "Account could not be updated" });
    }
  }

  if (req.method === "DELETE") {
    const userId = positiveId(body.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid account" });
    }
    if (userId === session.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });
    }
    try {
      const [, deleted] = await sql.transaction([
        sql`DELETE FROM attendance_record WHERE user_id = ${userId}`,
        sql`DELETE FROM users WHERE user_id = ${userId} RETURNING user_id`,
      ]);
      if (!deleted.length) {
        return res.status(404).json({ error: "Account not found" });
      }
      return res.status(200).json({ deleted: userId });
    } catch (error) {
      console.error("Account deletion failed:", error);
      return res.status(500).json({ error: "Account could not be deleted" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
