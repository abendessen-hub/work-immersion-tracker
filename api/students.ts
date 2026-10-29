import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { getSession, sql } from "./_lib.js";

type SpreadsheetRow = {
  lrn?: unknown;
  lastName?: unknown;
  firstName?: unknown;
  middleName?: unknown;
  section?: unknown;
  company?: unknown;
  contactNumber?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in first" });
  if (session.accessId < 2) {
    return res.status(403).json({ error: "Teacher access is required" });
  }

  const rawRows: unknown = req.body?.rows;
  if (!Array.isArray(rawRows) || rawRows.length === 0 || rawRows.length > 500) {
    return res
      .status(400)
      .json({ error: "Upload between 1 and 500 student rows" });
  }

  try {
    const [sections, companies, studentAccess] = await Promise.all([
      sql`SELECT section_id, section_name FROM section_reference`,
      sql`SELECT company_id, company_name FROM company_reference`,
      sql`SELECT access_id FROM access_reference WHERE lower(access_name) = 'student'`,
    ]);
    if (!studentAccess.length) {
      return res.status(500).json({
        error: "Student access role is missing from access_reference",
      });
    }

    const sectionByName = new Map(
      sections.map((section) => [
        normalize(String(section.section_name)),
        section,
      ]),
    );
    const companyByName = new Map(
      companies.map((company) => [
        normalize(String(company.company_name)),
        company,
      ]),
    );

    const errors: string[] = [];
    const accounts = rawRows.map((rawRow, index) => {
      const row = (
        typeof rawRow === "object" && rawRow !== null ? rawRow : {}
      ) as SpreadsheetRow;
      const lrn = text(row.lrn);
      const lastName = text(row.lastName);
      const firstName = text(row.firstName);
      const middleName = text(row.middleName);
      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(" ");
      const sectionName = text(row.section);
      const companyName = text(row.company);
      const contactNumber = text(row.contactNumber);
      const section = sectionByName.get(normalize(sectionName));
      const company = companyByName.get(normalize(companyName));
      const rowNumber = index + 2;

      if (!/^\d{4,}$/.test(lrn))
        errors.push(`Row ${rowNumber}: LRN must contain at least 4 digits.`);
      if (!lastName) errors.push(`Row ${rowNumber}: Last Name is required.`);
      if (!firstName) errors.push(`Row ${rowNumber}: First Name is required.`);
      if (!section)
        errors.push(
          `Row ${rowNumber}: Section "${sectionName}" was not found.`,
        );
      if (!company)
        errors.push(
          `Row ${rowNumber}: Company "${companyName}" was not found.`,
        );

      const suffix = lrn.slice(-4);
      const normalizedLastName = lastName
        .toLocaleLowerCase()
        .replace(/\s/g, "");
      const username = `${suffix}${normalizedLastName}`;
      const temporaryPassword = username;
      return {
        rowNumber,
        lrn,
        lastName,
        firstName,
        middleName,
        fullName,
        sectionName: section ? String(section.section_name) : sectionName,
        sectionId: section ? Number(section.section_id) : 0,
        companyName: company ? String(company.company_name) : companyName,
        companyId: company ? Number(company.company_id) : 0,
        contactNumber,
        username,
        temporaryPassword,
      };
    });

    const usernames = new Set<string>();
    for (const account of accounts) {
      if (usernames.has(account.username)) {
        errors.push(
          `Rows contain duplicate generated username "${account.username}".`,
        );
      }
      usernames.add(account.username);
    }

    if (errors.length)
      return res.status(400).json({ error: errors.join("\n") });

    const existing = await sql`
      SELECT username FROM users
      WHERE lower(username) = ANY(${accounts.map((account) => account.username)}::text[])
    `;
    if (existing.length) {
      const existingNames = existing
        .map((row) => String(row.username))
        .join(", ");
      return res.status(409).json({
        error: `These usernames already exist: ${existingNames}. No accounts were created.`,
      });
    }

    const hashedAccounts = await Promise.all(
      accounts.map(async (account) => ({
        ...account,
        passwordHash: await bcrypt.hash(account.temporaryPassword, 10),
      })),
    );
    const inserts = hashedAccounts.map(
      (account) => sql`
      INSERT INTO users
        (username, full_name, password, access_id, section_id, company_id, "changedPassword", contact_number)
      VALUES
        (${account.username}, ${account.fullName}, ${account.passwordHash}, ${studentAccess[0].access_id}, ${account.sectionId},
         ${account.companyId}, false, ${account.contactNumber})
      RETURNING user_id, username, full_name, access_id, section_id, company_id, contact_number
    `,
    );
    const created = await sql.transaction(inserts);

    return res.status(201).json({
      accounts: created.map((result, index) => ({
        ...result[0],
        temporaryPassword: accounts[index].temporaryPassword,
      })),
    });
  } catch (error) {
    console.error("Student account import failed:", error);
    return res
      .status(500)
      .json({ error: "Student accounts could not be created" });
  }
}
