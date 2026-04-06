import { kv } from "@vercel/kv";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const STORAGE_KEY = "nowPlaying.settings.v2";

const defaultSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png",
  expiresAt: null,
  showEqualizer: true
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const passwordHeader = req.headers['x-admin-password'];
  const bodyPassword = req.body?.password;
  
  // Normalize both for comparison
  const inputPassword = String(passwordHeader || bodyPassword || "").trim();
  const envPassword = String(process.env.ADMIN_PASSWORD || "").trim();

  // Logging for Vercel Dashboard (Functions -> Logs)
  // This helps identify if it's a length mismatch or missing env var
  console.log("Auth Attempt Details:");
  console.log("- Input length:", inputPassword.length);
  console.log("- Env Var configured:", !!envPassword);
  console.log("- Env Var length:", envPassword.length);
  console.log("- Method:", req.method);

  if (req.method === "GET") {
    try {
      const settings: any = (await kv.get(STORAGE_KEY)) || defaultSettings;
      if (settings.showEqualizer === undefined) settings.showEqualizer = true;
      if (settings.enabled && settings.expiresAt && Date.now() > settings.expiresAt) {
        settings.enabled = false;
        settings.expiresAt = null;
        await kv.set(STORAGE_KEY, settings);
      }
      return res.status(200).json(settings);
    } catch (error) {
      console.error("KV fetch error:", error);
      return res.status(200).json(defaultSettings);
    }
  }

  if (req.method === "POST") {
    const { action, settings, durationMinutes } = req.body;

    if (!envPassword) {
      return res.status(500).json({ error: "ADMIN_PASSWORD not set in Vercel" });
    }

    if (!inputPassword || inputPassword !== envPassword) {
      console.warn(`Unauthorized attempt: Received length ${inputPassword.length}, Expected ${envPassword.length}`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (action === "verify") {
      return res.status(200).json({ success: true });
    }

    try {
      const newSettings = { ...settings };
      if (durationMinutes && durationMinutes > 0) {
        newSettings.expiresAt = Date.now() + durationMinutes * 60 * 1000;
      } else if (durationMinutes === 0 || durationMinutes === -2) {
        newSettings.expiresAt = null;
      }

      await kv.set(STORAGE_KEY, newSettings);
      return res.status(200).json({ success: true, settings: newSettings });
    } catch (error) {
      console.error("KV update error:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
