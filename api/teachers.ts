import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { getSession, sql } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in first" });
  if (session.accessId < 3) {
    return res.status(403).json({ error: "Admin access is required" });
  }

  const body =
    typeof req.body === "object" && req.body !== null ? req.body : {};
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const username =
    typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const contactNumber =
    typeof body.contactNumber === "string" ? body.contactNumber.trim() : "";

  if (!fullName || !username || !password || !contactNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  try {
    const teacherAccess = await sql`
      SELECT access_id FROM access_reference WHERE lower(access_name) = 'teacher'
    `;
    if (!teacherAccess.length) {
      return res.status(500).json({
        error: "Teacher access role is missing from access_reference",
      });
    }
    const existing =
      await sql`SELECT user_id FROM users WHERE lower(username) = ${username}`;
    if (existing.length) {
      return res.status(409).json({ error: "That username is already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await sql`
      INSERT INTO users
        (username, full_name, password, access_id, section_id, company_id, "changedPassword", contact_number)
      VALUES
        (${username}, ${fullName}, ${passwordHash}, ${teacherAccess[0].access_id}, NULL, NULL, true, ${contactNumber})
      RETURNING user_id, username, full_name, access_id
    `;

    return res.status(201).json({ user: created[0] });
  } catch (error) {
    console.error("Teacher account creation failed:", error);
    return res
      .status(500)
      .json({ error: "Teacher account could not be created" });
  }
}
