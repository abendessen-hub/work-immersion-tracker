import type { VercelRequest } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

export const sql = neon(process.env.DATABASE_URL!);

export type Session = {
  userId: number;
  username: string;
  accessId: number;
  sectionId: number | null;
  companyId: number | null;
  changedPassword: boolean;
};

export function getSession(req: VercelRequest): Session | null {
  const token = req.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("session="))
    ?.slice("session=".length);

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "string") return null;
    const userId = Number(decoded.userId);
    const accessId = Number(decoded.accessId);
    if (!Number.isInteger(userId) || !Number.isInteger(accessId)) return null;

    return {
      userId,
      username: String(decoded.username ?? ""),
      accessId,
      sectionId: decoded.sectionId == null ? null : Number(decoded.sectionId),
      companyId: decoded.companyId == null ? null : Number(decoded.companyId),
      changedPassword: Boolean(decoded.changedPassword),
    };
  } catch {
    return null;
  }
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
