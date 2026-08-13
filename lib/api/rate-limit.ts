/**
 * Lightweight in-memory rate limiter for abuse-sensitive API routes.
 * Best-effort on serverless (per-instance); still blocks naive floods.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= nowMs) buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= nowMs) {
    buckets.set(key, { count: 1, resetAt: nowMs + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1) };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - nowMs) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: Math.max(0, limit - existing.count) };
}

/** Test helper — clears all buckets. */
export function resetRateLimitBucketsForTests(): void {
  buckets.clear();
}

export function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}
