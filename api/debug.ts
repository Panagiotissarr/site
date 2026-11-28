import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIp, rateCheck, rateHit, rateReset, safeEqual } from "../lib/security";

const STORAGE_KEY = "nowPlaying.settings.v2";

/** Failed authentications allowed per client inside the window. */
const AUTH_FAIL_LIMIT = 8;
const AUTH_FAIL_WINDOW_SEC = 15 * 60;

const MAX_LABEL = 80;
const MAX_TITLE = 160;
const MAX_IMAGE_URL = 2048;

const defaultSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png",
  expiresAt: null,
  showEqualizer: true,
  showImage: true,
  lastUpdated: Date.now(),
  lastfmEnabled: true
};

const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

/**
 * The widget only ever renders these fields, so this is the entire public
 * contract of the endpoint - anything else stored under the same key is
 * dropped on read and on write.
 */
type PublicSettings = {
  enabled: boolean;
  label: string;
  title: string;
  imageUrl: string;
  expiresAt: number | null;
  showEqualizer: boolean;
  showImage: boolean;
  lastUpdated: number;
  lastfmEnabled: boolean;
};

/**
 * Only locations this endpoint is allowed to hand to an <img>:
 * a same-origin path, an https URL, or an inline image data URL.
 * javascript:, data:text/html, vbscript:, protocol-relative "//host"
 * and backslash variants are all rejected.
 */
function isSafeImageUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAX_IMAGE_URL) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) return true;
  if (/^https:\/\/[^\s"'<>\\]+$/i.test(value)) return true;
  if (/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i.test(value)) return true;
  return false;
}

function asText(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Storage may hold an object or a JSON string; normalize either. */
function parseStored(raw: unknown): Record<string, unknown> {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = null;
    }
  }
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Coerce anything read from storage into the whitelisted public shape. */
function readSettings(raw: unknown): PublicSettings {
  const src = parseStored(raw);

  const lastUpdatedRaw = Number(src.lastUpdated);
  const expiresRaw = src.expiresAt === null ? null : Number(src.expiresAt);

  return {
    enabled: asBool(src.enabled, defaultSettings.enabled),
    label: asText(src.label, defaultSettings.label, MAX_LABEL),
    title: asText(src.title, defaultSettings.title, MAX_TITLE),
    imageUrl:
      typeof src.imageUrl === "string" && isSafeImageUrl(src.imageUrl)
        ? src.imageUrl
        : defaultSettings.imageUrl,
    expiresAt: expiresRaw !== null && Number.isFinite(expiresRaw) ? expiresRaw : null,
    showEqualizer: asBool(src.showEqualizer, defaultSettings.showEqualizer),
    showImage: asBool(src.showImage, defaultSettings.showImage),
    lastUpdated: Number.isFinite(lastUpdatedRaw) && lastUpdatedRaw > 0
      ? lastUpdatedRaw
      : Date.now(),
    lastfmEnabled: asBool(src.lastfmEnabled, defaultSettings.lastfmEnabled),
  };
}

/** Validate the fields the admin form is allowed to change. */
function applySettings(
  current: PublicSettings,
  input: Record<string, unknown>
): { settings: PublicSettings } | { error: string } {
  const next: PublicSettings = { ...current };

  for (const key of ["enabled", "showEqualizer", "showImage", "lastfmEnabled"] as const) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== "boolean") return { error: `${key} must be a boolean` };
      next[key] = input[key] as boolean;
    }
  }

  if (input.label !== undefined) {
    if (typeof input.label !== "string") return { error: "label must be a string" };
    next.label = asText(input.label, current.label, MAX_LABEL);
  }
  if (input.title !== undefined) {
    if (typeof input.title !== "string") return { error: "title must be a string" };
    next.title = asText(input.title, current.title, MAX_TITLE);
  }
  if (input.imageUrl !== undefined) {
    if (typeof input.imageUrl !== "string" || !isSafeImageUrl(input.imageUrl)) {
      return { error: "imageUrl must be a local path, an https URL or an image data URL" };
    }
    next.imageUrl = input.imageUrl;
  }

  return { settings: next };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      try {
        const stored: any = (await redis.get(STORAGE_KEY)) || defaultSettings;
        const settings = readSettings(stored);

        // Lazily switch an expired widget off, persisting the sanitized row.
        if (settings.enabled && settings.expiresAt && Date.now() > settings.expiresAt) {
          settings.enabled = false;
          settings.expiresAt = null;
          settings.lastUpdated = Date.now();
          await redis.set(STORAGE_KEY, settings);
        }
        return res.status(200).json(settings);
      } catch (kvError) {
        // Public widget: degrade to the defaults rather than failing hard.
        console.error("[debug] redis read failed:", kvError instanceof Error ? kvError.message : "unknown");
        return res.status(200).json(readSettings(null));
      }
    }

    if (req.method === "POST") {
      const ip = clientIp(req.headers);

      // Brute-force guard, checked before any password work is done.
      if (ip) {
        const gate = await rateCheck("auth-fail", ip, AUTH_FAIL_LIMIT, AUTH_FAIL_WINDOW_SEC);
        if (!gate.allowed) {
          res.setHeader("Retry-After", String(gate.retryAfterSec));
          return res.status(429).json({ error: "Too many attempts. Try again later." });
        }
      }

      const body: Record<string, unknown> =
        req.body && typeof req.body === "object" && !Array.isArray(req.body)
          ? (req.body as Record<string, unknown>)
          : {};

      const headerValue = req.headers["x-admin-password"];
      const headerPassword = Array.isArray(headerValue) ? headerValue[0] : headerValue;
      const candidate =
        typeof headerPassword === "string" && headerPassword.length > 0
          ? headerPassword
          : body.password;
      const inputPassword = typeof candidate === "string" ? candidate.trim() : "";

      const envPassword = String(process.env.ADMIN_PASSWORD || "").trim();

      // Fail closed on missing configuration, but stay generic: the response
      // must not reveal which environment variables exist.
      if (!envPassword) {
        console.error("[debug] ADMIN_PASSWORD is not configured");
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!inputPassword || !safeEqual(inputPassword, envPassword)) {
        if (ip) await rateHit("auth-fail", ip, AUTH_FAIL_WINDOW_SEC);
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (ip) await rateReset("auth-fail", ip);

      if (body.action === "verify") {
        return res.status(200).json({ success: true });
      }

      const settingsInput = body.settings;
      if (!settingsInput || typeof settingsInput !== "object" || Array.isArray(settingsInput)) {
        return res.status(400).json({ error: "settings must be an object" });
      }

      let stored: PublicSettings;
      try {
        stored = readSettings((await redis.get(STORAGE_KEY)) || defaultSettings);
      } catch (kvError) {
        console.error("[debug] redis read failed:", kvError instanceof Error ? kvError.message : "unknown");
        return res.status(500).json({ error: "Database unavailable" });
      }

      const applied = applySettings(stored, settingsInput as Record<string, unknown>);
      if ("error" in applied) return res.status(400).json({ error: applied.error });

      const minutes = body.durationMinutes === undefined || body.durationMinutes === null
        ? 0
        : Number(body.durationMinutes);
      if (!Number.isFinite(minutes)) {
        return res.status(400).json({ error: "durationMinutes must be a number" });
      }

      const newSettings: PublicSettings = {
        ...applied.settings,
        expiresAt: minutes > 0 ? Date.now() + minutes * 60_000 : null,
        lastUpdated: Date.now(),
      };

      try {
        await redis.set(STORAGE_KEY, newSettings);
        return res.status(200).json({ success: true, settings: newSettings });
      } catch (kvError) {
        console.error("[debug] redis write failed:", kvError instanceof Error ? kvError.message : "unknown");
        return res.status(500).json({ error: "Database update failed" });
      }
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (globalError) {
    // Full detail stays in the server logs; the client gets a generic body.
    console.error("[debug] unhandled error:", globalError instanceof Error ? globalError.message : "unknown");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
