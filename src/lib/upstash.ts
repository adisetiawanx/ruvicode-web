import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash rate limiter for playground.
 * 5 requests per hour per IP identifier.
 *
 * Uses Upstash free tier (10K requests/day).
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set,
 * the rate limiter is null and playground falls back to a permissive mode
 * (no rate limiting — for local development only).
 */
const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit: Ratelimit | null = hasUpstashConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ruvicode-playground",
    })
  : null;

/**
 * Rate limit a playground request.
 * Returns { success, remaining }.
 * If no Upstash config (local dev), always succeeds with remaining=5.
 */
export async function limitPlaygroundRequest(
  identifier: string,
): Promise<{ success: boolean; remaining: number }> {
  if (!ratelimit) {
    return { success: true, remaining: 5 };
  }
  const result = await ratelimit.limit(`playground:${identifier}`);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
