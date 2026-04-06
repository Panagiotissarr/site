import { kv } from "@vercel/kv";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const STORAGE_KEY = "nowPlaying.settings.v2";

const defaultSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const passwordHeader = req.headers['x-admin-password'];
  const bodyPassword = req.body?.password;
  const password = passwordHeader || bodyPassword;

  if (req.method === "GET") {
    try {
      const settings = (await kv.get(STORAGE_KEY)) || defaultSettings;
      return res.status(200).json(settings);
    } catch (error) {
      console.error("KV fetch error:", error);
      return res.status(200).json(defaultSettings);
    }
  }

  if (req.method === "POST") {
    const { action, settings } = req.body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (action === "verify") {
      return res.status(200).json({ success: true });
    }

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings" });
    }

    try {
      await kv.set(STORAGE_KEY, settings);
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error("KV update error:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
