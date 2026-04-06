import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const passwordHeader = req.headers['x-admin-password'];
  const envPassword = String(process.env.ADMIN_PASSWORD || "").trim();

  if (!passwordHeader || passwordHeader !== envPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { filename, contentType, data } = req.body;
    
    if (!data || !filename) {
      return res.status(400).json({ error: "Missing data or filename" });
    }

    // Convert base64 to buffer
    const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const blob = await put(filename, buffer, {
      contentType,
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: String(error) });
  }
}
