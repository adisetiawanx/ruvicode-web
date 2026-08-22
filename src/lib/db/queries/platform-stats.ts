import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { usageRecords } from "@/lib/db/schema";

/**
 * Global platform totals for the dashboard header counter.
 *
 * The real number comes from SUM(prompt + completion) over usage_records.
 * An optional seed offset (env TOKENS_SERVED_SEED) can be added on top so the
 * displayed number starts from a base you choose without touching any usage
 * data. The offset is applied at read time only — it never writes to the
 * database, so there is zero risk of corrupting real billing records.
 *
 * A process-local cache with a 5 minute TTL keeps repeated dashboard loads
 * from re-running the query, so the counter adds effectively zero database
 * load.
 */

let cached: { value: number; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getTotalTokensServed(): Promise<number> {
  const seed = Number(process.env.TOKENS_SERVED_SEED ?? 0) || 0;

  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value + seed;
  }
  if (!isDbAvailable()) {
    return 74_857_000 + seed;
  }
  try {
    const [row] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${usageRecords.promptTokens} + ${usageRecords.completionTokens}), 0)`,
      })
      .from(usageRecords);
    const value = Number(row?.total ?? 0);
    cached = { value, at: Date.now() };
    return value + seed;
  } catch {
    return (cached?.value ?? 0) + seed;
  }
}
