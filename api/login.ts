import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL!);

const DUMMY_HASH =
  "$2a$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Never trust the client shape — narrow it yourself
  const body =
    typeof req.body === "object" && req.body !== null ? req.body : {};
  const { username, password } = body as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password required" });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const rows = await sql`
      SELECT user_id, username, password, access_id, section_id, company_id, "changedPassword"
      FROM users
      WHERE username = ${cleanUsername}
    `;

    const user = rows[0];

    const isValidPassword = user
      ? await bcrypt.compare(password, user.password)
      : (await bcrypt.compare(password, DUMMY_HASH), false);

    if (!user || !isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        accessId: user.access_id,
        sectionId: user.section_id,
        companyId: user.company_id,
        changedPassword: Boolean(user.changedPassword),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`,
    );

    return res.status(200).json({
      success: true,
      userId: user.user_id,
      username: user.username,
      accessId: user.access_id,
      sectionId: user.section_id,
      companyId: user.company_id,
      changedPassword: Boolean(user.changedPassword),
    });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
