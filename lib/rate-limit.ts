/**
 * Simple in-memory sliding-window rate limiter (per Node process).
 * For multi-instance deployments, replace with Redis/Upstash later.
 */
const buckets = new Map<string, number[]>();

export function takeRateLimitToken(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const prev = buckets.get(key) ?? [];
  const kept = prev.filter((t) => t > windowStart);
  if (kept.length >= max) {
    buckets.set(key, kept);
    return false;
  }
  kept.push(now);
  buckets.set(key, kept);
  return true;
}
