import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSession, sql } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!getSession(req)) {
    return res.status(401).json({ error: "Please sign in first" });
  }

  try {
    const [sections, companies] = await Promise.all([
      sql`SELECT section_id, section_name FROM section_reference ORDER BY section_name`,
      sql`SELECT company_id, company_name FROM company_reference ORDER BY company_name`,
    ]);

    return res.status(200).json({ sections, companies });
  } catch (error) {
    console.error("Could not load section and company references:", error);
    return res.status(500).json({ error: "Could not load reference data" });
  }
}
