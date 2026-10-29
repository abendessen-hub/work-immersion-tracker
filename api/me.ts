import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract cookies from request headers
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    }),
  );

  const token = cookies.session;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No session cookie" });
  }

  try {
    // Verify JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      username: string;
      fullname: string;
      accessId: number;
      sectionId: number | null;
      companyId: number | null;
      changedPassword: boolean;
    };

    return res.status(200).json({
      success: true,
      userId: decoded.userId,
      username: decoded.username,
      fullname: decoded.fullname,
      accessId: decoded.accessId,
      sectionId: decoded.sectionId,
      companyId: decoded.companyId,
      changedPassword: decoded.changedPassword,
    });
  } catch {
    return res.status(403).json({ error: "Invalid or expired session" });
  }
}
