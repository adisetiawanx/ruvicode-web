import Redis from "ioredis";
import { env } from "@/lib/env";

/**
 * API key cache invalidation.
 *
 * The Go gateway validates `rvcd_` keys through a Redis cache entry
 * `apikey:{sha256(fullKey)}` with a 5 minute TTL. When the dashboard revokes
 * a key or changes its limits, the Postgres row is the source of truth but
 * the cached entry would keep serving the old state for up to 5 minutes.
 * Deleting the same Redis key makes the change effective immediately.
 *
 * REDIS_URL points at the same Redis instance the gateway uses (shared dev
 * infra in development, the compose-managed Redis in production). When it is
 * not configured, invalidation is a no-op and the natural TTL applies.
 */

let client: Redis | null = null;

async function getClient(): Promise<Redis | null> {
  if (!env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      // Fail fast instead of queueing or retrying when Redis is down; the
      // Postgres row is authoritative and the cache TTL covers the gap.
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: null,
    });
    client.on("error", (err) => {
      console.error("api key cache redis error:", err.message);
    });
  }
  if (client.status === "wait") {
    try {
      await client.connect();
    } catch (err) {
      console.error("api key cache redis connect failed:", err);
      return null;
    }
  }
  if (client.status !== "ready") return null;
  return client;
}

/**
 * Delete the cached entry for a key hash so the gateway re-reads Postgres on
 * the next request. Best effort: a Redis failure is logged, never fatal, and
 * the 5 minute TTL bounds the staleness window.
 */
export async function invalidateKeyCache(keyHash: string): Promise<void> {
  const c = await getClient();
  if (!c) return;
  try {
    await c.del(`apikey:${keyHash}`);
  } catch (err) {
    console.error("failed to invalidate api key cache:", err);
  }
}
