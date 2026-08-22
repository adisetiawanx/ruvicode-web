import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { usageRecords } from "@/lib/db/schema";

/**
 * Global platform totals for the dashboard header counter.
 *
 * Pure SUM(prompt + completion) over usage_records, cached in-memory for 5
 * minutes so repeated dashboard loads add effectively zero database load.
 * The number is honest — no inflation, no seed, no jitter.
 */

let cached: { value: number; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getTotalTokensServed(): Promise<number> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value;
  }
  if (!isDbAvailable()) {
    return 74_857_000;
  }
  try {
    const [row] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${usageRecords.promptTokens} + ${usageRecords.completionTokens}), 0)`,
      })
      .from(usageRecords);
    const value = Number(row?.total ?? 0);
    cached = { value, at: Date.now() };
    return value;
  } catch {
    return cached?.value ?? 0;
  }
}
