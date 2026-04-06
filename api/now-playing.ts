import { Redis } from "@upstash/redis";
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

const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const passwordHeader = req.headers['x-admin-password'];
    const bodyPassword = req.body?.password;
    
    const inputPassword = String(passwordHeader || bodyPassword || "").trim();
    const envPassword = String(process.env.ADMIN_PASSWORD || "").trim();

    if (req.method === "GET") {
      try {
        const settings: any = (await redis.get(STORAGE_KEY)) || defaultSettings;
        let finalSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
        if (finalSettings.showEqualizer === undefined) finalSettings.showEqualizer = true;
        
        if (finalSettings.enabled && finalSettings.expiresAt && Date.now() > finalSettings.expiresAt) {
          finalSettings.enabled = false;
          finalSettings.expiresAt = null;
          await redis.set(STORAGE_KEY, finalSettings);
        }
        return res.status(200).json(finalSettings);
      } catch (kvError) {
        console.error("Redis fetch error:", kvError);
        return res.status(200).json(defaultSettings);
      }
    }

    if (req.method === "POST") {
      // Logic for Unauthorized response with debug info
      if (!envPassword) {
        return res.status(500).json({ error: "ADMIN_PASSWORD not set in Vercel environment." });
      }

      if (!inputPassword || inputPassword !== envPassword) {
        console.warn(`Auth mismatch: Input(${inputPassword.length}) vs Env(${envPassword.length})`);
        return res.status(401).json({ 
          error: "Unauthorized",
          debug: {
            receivedLength: inputPassword.length,
            expectedLength: envPassword.length,
            viaHeader: !!passwordHeader,
            viaBody: !!bodyPassword
          }
        });
      }

      const { action, settings, durationMinutes } = req.body;

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

        await redis.set(STORAGE_KEY, newSettings);
        return res.status(200).json({ success: true, settings: newSettings });
      } catch (kvError) {
        console.error("Redis update error:", kvError);
        return res.status(500).json({ error: "Database update failed" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (globalError) {
    console.error("Global API Error:", globalError);
    return res.status(500).json({ error: "Internal Server Error", details: String(globalError) });
  }
}
