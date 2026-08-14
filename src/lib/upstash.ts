import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash rate limiter for the playground.
 *
 * Public playground: 5 requests per hour per IP identifier.
 * Dashboard playground: 50 requests per hour per user id.
 *
 * Uses Upstash free tier (10K requests/day).
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set,
 * the rate limiter is null and the playground falls back to a permissive
 * mode (no rate limiting — for local development only).
 */
const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function makeLimiter(limit: number, window: Duration): Ratelimit | null {
  if (!hasUpstashConfig) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "ruvicode-playground",
  });
}

/**
 * Rate limit a playground request by identifier (IP for the public page,
 * user id for the dashboard page).
 * Returns { success, remaining }.
 * If no Upstash config (local dev), always succeeds with remaining=limit.
 */
export async function limitPlaygroundRequest(
  identifier: string,
  limit = 5,
  window: Duration = "1 h",
): Promise<{ success: boolean; remaining: number }> {
  const limiter = makeLimiter(limit, window);
  if (!limiter) {
    return { success: true, remaining: limit };
  }
  const result = await limiter.limit(`playground:${identifier}`);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
