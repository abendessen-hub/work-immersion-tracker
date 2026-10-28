import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    }),
  );

  const token = cookies.session;
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Please log in again" });
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    userId = decoded.userId;
  } catch {
    return res.status(403).json({ error: "Invalid or expired session" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters long" });
  }

  try {
    const users = await sql`
      SELECT user_id, username, password, access_id, section_id, company_id, "changedPassword"
      FROM users
      WHERE user_id = ${userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    if (user.changedPassword) {
      return res.status(401).json({ error: "Already changed password" });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await sql`
      UPDATE users 
      SET password = ${hashedNewPassword}, "changedPassword" = true
      WHERE user_id = ${userId}
    `;

    const refreshedToken = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        accessId: user.access_id,
        sectionId: user.section_id,
        companyId: user.company_id,
        changedPassword: true,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    const isProduction = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `session=${refreshedToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`,
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
