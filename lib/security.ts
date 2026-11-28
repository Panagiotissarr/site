import { createHash, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

/**
 * Shared security helpers for the serverless functions in /api.
 *
 * This file intentionally lives outside /api so it is not exposed as its own
 * endpoint; the handlers import it through a relative path, which Vercel's
 * Node.js builder traces and bundles together with each function.
 */

const RATE_PREFIX = "sec:rl:";

/** Log a diagnostic line server-side only. Never logs secrets or bodies. */
function logSecurity(message: string, err?: unknown): void {
  const detail = err
    ? String(err instanceof Error ? err.message : err).slice(0, 200)
    : "";
  console.warn(`[security] ${message}${detail ? `: ${detail}` : ""}`);
}

let rateStore: Redis | null | undefined;

/** Lazily build the Upstash client used by the rate limiter. */
function limiter(): Redis | null {
  if (rateStore !== undefined) return rateStore;
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    rateStore = url && token ? new Redis({ url, token }) : null;
  } catch (err) {
    logSecurity("rate limiter store unavailable", err);
    rateStore = null;
  }
  if (!rateStore) {
    logSecurity("rate limiting is disabled (no store configured)");
  }
  return rateStore;
}

/**
 * Constant-time secret comparison.
 *
 * Both values are hashed to a fixed 32-byte digest first, so `timingSafeEqual`
 * can never throw on differing lengths and the response time cannot reveal the
 * length of the expected secret.
 */
export function safeEqual(input: unknown, expected: unknown): boolean {
  if (typeof input !== "string" || input.length === 0) return false;
  if (typeof expected !== "string" || expected.length === 0) return false;
  // Re-wrap as fresh Uint8Arrays so the digests satisfy the stricter
  // ArrayBuffer-typed signature of timingSafeEqual in TypeScript >= 5.7.
  const a = Uint8Array.from(createHash("sha256").update(input, "utf8").digest());
  const b = Uint8Array.from(createHash("sha256").update(expected, "utf8").digest());
  return timingSafeEqual(a, b);
}

/**
 * Best-effort client IP for rate-limit buckets.
 *
 * `x-forwarded-for` may hold a chain; the LAST entry is the one appended by
 * the nearest trusted proxy (Vercel), so it is the least spoofable value.
 * Returns undefined when nothing usable is present - callers then skip rate
 * limiting rather than funneling every unknown client into one shared bucket
 * (which could lock legitimate users out).
 */
export function clientIp(
  headers: Record<string, string | string[] | undefined>
): string | undefined {
  const raw = headers["x-forwarded-for"];
  const chain = (Array.isArray(raw) ? raw.join(",") : raw) || "";
  const parts = chain.split(",").map((p) => p.trim()).filter(Boolean);
  const candidate = parts.length ? parts[parts.length - 1] : "";
  const safe = candidate.replace(/[^A-Za-z0-9.:_-]/g, "").slice(0, 45);
  return safe.length >= 2 ? safe : undefined;
}

export type RateLimitOutcome = {
  allowed: boolean;
  retryAfterSec: number;
};

function rateKey(bucket: string, key: string): string {
  const cleanBucket = bucket.replace(/[^A-Za-z0-9_-]/g, "") || "default";
  const cleanKey = key.replace(/[^A-Za-z0-9.:_-]/g, "").slice(0, 45) || "unknown";
  return `${RATE_PREFIX}${cleanBucket}:${cleanKey}`;
}

/**
 * Read-only rate-limit check: is this bucket already exhausted?
 *
 * Fails OPEN (allowed) whenever the store cannot be reached or configured, so
 * an Upstash outage can never lock the site owner out of their own admin API.
 */
export async function rateCheck(
  bucket: string,
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitOutcome> {
  const store = limiter();
  if (!store) return { allowed: true, retryAfterSec: 0 };
  const k = rateKey(bucket, key);
  try {
    const count = Number((await store.get<number>(k)) ?? 0) || 0;
    if (count < limit) return { allowed: true, retryAfterSec: 0 };
    const ttl = Number(await store.ttl(k));
    return {
      allowed: false,
      retryAfterSec: Number.isFinite(ttl) && ttl > 0 ? ttl : windowSec,
    };
  } catch (err) {
    logSecurity("rate limit check failed", err);
    return { allowed: true, retryAfterSec: 0 };
  }
}

/**
 * Count one use of a rate-limited action and (re)arm the window TTL.
 * The TTL is re-armed whenever it is missing, so a crash between `incr` and
 * `expire` can never produce a permanent lockout.
 */
export async function rateHit(
  bucket: string,
  key: string,
  windowSec: number
): Promise<void> {
  const store = limiter();
  if (!store) return;
  const k = rateKey(bucket, key);
  try {
    const count = Number(await store.incr(k));
    if (count <= 1) {
      await store.expire(k, windowSec);
    } else {
      const ttl = Number(await store.ttl(k));
      if (!Number.isFinite(ttl) || ttl < 0) await store.expire(k, windowSec);
    }
  } catch (err) {
    logSecurity("rate limit increment failed", err);
  }
}

/** Clear a bucket (used after a successful authentication). */
export async function rateReset(bucket: string, key: string): Promise<void> {
  const store = limiter();
  if (!store) return;
  try {
    await store.del(rateKey(bucket, key));
  } catch (err) {
    logSecurity("rate limit reset failed", err);
  }
}
