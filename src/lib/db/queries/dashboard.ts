/**
 * Dashboard data queries.
 *
 * Reads from Postgres via Drizzle ORM when the database is available.
 * Falls back to static seed data for local dev without Docker.
 *
 * SECURITY: All functions take a `userId` that MUST come from the
 * authenticated session. Every query is scoped `.where(eq(table.userId, userId))`.
 */

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { apiKeys, usageRecords, wallets } from "@/lib/db/schema";

// ── Types ──

export interface WalletData {
  balance: string;
  held: string;
  totalLoaded: string;
  totalSpent: string;
}

export interface MonthlySummary {
  spent: number;
  requestCount: number;
  savings: number;
}

export interface DailyUsage {
  date: string;
  /** UTC day bucket as YYYY-MM-DD, so the chart can relabel it in the
   *  viewer's timezone (see usage-chart.tsx). Null on the mock path. */
  isoDate: string | null;
  cost: number;
  requests: number;
}

export interface ModelBreakdownEntry {
  model: string;
  cost: number;
  pct: number;
}

export interface RecentActivityEntry {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  /** Cached prompt tokens (null = historical row before cache billing). */
  cacheReadTokens: number | null;
  cost: string;
  createdAt: Date;
  keyLabel: string | null;
}

// ── Helpers ──

/** Return a Date for the start of the current month in UTC. */
function startOfMonthUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** For the weekly chart: return a Date for 7 days ago at midnight UTC. */
function sevenDaysAgoUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7));
}

// ── Mock seed data ──
// Mirrors the Postgres schema. Used when `isDbAvailable()` is false.

const MOCK_WALLET: WalletData = {
  balance: "42.50",
  held: "0.00",
  totalLoaded: "85.00",
  totalSpent: "42.50",
};

const MOCK_MONTHLY_SPENT = 3.24;
const MOCK_MONTHLY_REQUESTS = 1247;
const MOCK_MONTHLY_SAVINGS = 8.91;

const MOCK_WEEKLY_USAGE: DailyUsage[] = [
  { date: "Mon", isoDate: null, cost: 0.42, requests: 180 },
  { date: "Tue", isoDate: null, cost: 0.31, requests: 142 },
  { date: "Wed", isoDate: null, cost: 0.88, requests: 321 },
  { date: "Thu", isoDate: null, cost: 0.56, requests: 245 },
  { date: "Fri", isoDate: null, cost: 0.72, requests: 298 },
  { date: "Sat", isoDate: null, cost: 0.19, requests: 88 },
  { date: "Sun", isoDate: null, cost: 0.16, requests: 73 },
];

const MOCK_MODEL_BREAKDOWN: ModelBreakdownEntry[] = [
  { model: "glm-5.2", cost: 1.20, pct: 37 },
  { model: "claude-sonnet-5", cost: 0.80, pct: 25 },
  { model: "deepseek-v4-flash", cost: 0.60, pct: 19 },
  { model: "gpt-5.4", cost: 0.40, pct: 12 },
  { model: "other", cost: 0.22, pct: 7 },
];

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;

const MOCK_RECENT_ACTIVITY: RecentActivityEntry[] = [
  { keyLabel: "Production", id: "rec-1", model: "glm-5.2", cacheReadTokens: 106, promptTokens: 320, completionTokens: 930, cost: "0.000231", createdAt: new Date(NOW - 2 * MIN) },
  { keyLabel: "Test", id: "rec-2", model: "claude-sonnet-5", cacheReadTokens: 400, promptTokens: 1200, completionTokens: 2200, cost: "0.013400", createdAt: new Date(NOW - 5 * MIN) },
  { keyLabel: "Production", id: "rec-3", model: "deepseek-v4-flash", cacheReadTokens: 1366, promptTokens: 4100, completionTokens: 4800, cost: "0.000162", createdAt: new Date(NOW - 12 * MIN) },
  { keyLabel: "Test", id: "rec-4", model: "gpt-5.4", cacheReadTokens: 283, promptTokens: 850, completionTokens: 1150, cost: "0.001575", createdAt: new Date(NOW - 25 * MIN) },
  { keyLabel: "Production", id: "rec-5", model: "glm-5.2", cacheReadTokens: 70, promptTokens: 210, completionTokens: 540, cost: "0.000142", createdAt: new Date(NOW - 38 * MIN) },
  { keyLabel: "Test", id: "rec-6", model: "claude-sonnet-5", cacheReadTokens: 1133, promptTokens: 3400, completionTokens: 5600, cost: "0.034200", createdAt: new Date(NOW - 1 * HOUR) },
  { keyLabel: "Production", id: "rec-7", model: "gpt-5.4", cacheReadTokens: 240, promptTokens: 720, completionTokens: 980, cost: "0.001364", createdAt: new Date(NOW - 1.5 * HOUR) },
  { keyLabel: "Test", id: "rec-8", model: "deepseek-v4-flash", cacheReadTokens: 866, promptTokens: 2600, completionTokens: 3100, cost: "0.000097", createdAt: new Date(NOW - 2 * HOUR) },
  { keyLabel: "Production", id: "rec-9", model: "glm-5.2", cacheReadTokens: 60, promptTokens: 180, completionTokens: 420, cost: "0.000108", createdAt: new Date(NOW - 3 * HOUR) },
  { keyLabel: "Test", id: "rec-10", model: "claude-sonnet-5", cacheReadTokens: 316, promptTokens: 950, completionTokens: 1800, cost: "0.010850", createdAt: new Date(NOW - 4 * HOUR) },
];

// ── Query functions ──

/**
 * Get the user's wallet balance, held amount, total loaded, and total spent.
 */
export async function getWallet(userId: string): Promise<WalletData> {
  if (!isDbAvailable()) return MOCK_WALLET;

  const [row] = await db
    .select({
      balance: wallets.balance,
      held: wallets.held,
      totalLoaded: wallets.totalLoaded,
      totalSpent: wallets.totalSpent,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  return row
    ? {
        balance: row.balance,
        held: row.held,
        totalLoaded: row.totalLoaded,
        totalSpent: row.totalSpent,
      }
    : { balance: "0", held: "0", totalLoaded: "0", totalSpent: "0" };
}

/**
 * Get the user's month-to-date spend, request count, and savings.
 * Savings = ref_cost minus cost (what the user avoided paying vs the reference
 * price, captured at settlement time so it never drifts with market moves).
 */
export async function getMonthlySummary(
  userId: string,
): Promise<MonthlySummary> {
  if (!isDbAvailable()) {
    return {
      spent: MOCK_MONTHLY_SPENT,
      requestCount: MOCK_MONTHLY_REQUESTS,
      savings: MOCK_MONTHLY_SAVINGS,
    };
  }

  const monthStart = startOfMonthUTC();

  const [row] = await db
    .select({
      spent: sql<number>`COALESCE(SUM(${usageRecords.cost}),0)`,
      requestCount: sql<number>`COUNT(*)`,
      savings: sql<number>`COALESCE(SUM(${usageRecords.refCost} - ${usageRecords.cost}),0)`,
    })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        gte(usageRecords.createdAt, monthStart),
      ),
    );

  // SUM() over numeric columns comes back from pg as a string, even though
  // the sql<number> type claims otherwise. Coerce at the boundary so
  // downstream .toFixed() calls cannot crash the render.
  return {
    spent: Number(row?.spent ?? 0),
    requestCount: Number(row?.requestCount ?? 0),
    savings: Number(row?.savings ?? 0),
  };
}

/**
 * Get daily usage aggregation for the last 7 days.
 *
 * Aggregates directly from `usage_records` (the source of truth written by
 * the gateway) instead of `usage_hourly`, because no aggregation worker
 * populates that table yet. The (user_id, created_at) index keeps this
 * cheap at MVP scale. Revisit if per-user usage grows past ~100k rows.
 */
export async function getWeeklyUsage(userId: string): Promise<DailyUsage[]> {
  if (!isDbAvailable()) return MOCK_WEEKLY_USAGE;

  const sevenDaysAgo = sevenDaysAgoUTC();

  const rows = await db
    .select({
      date: sql<string>`TO_CHAR(DATE_TRUNC('day', ${usageRecords.createdAt}), 'Dy')`,
      isoDate: sql<string>`TO_CHAR(DATE_TRUNC('day', ${usageRecords.createdAt}), 'YYYY-MM-DD')`,
      cost: sql<number>`COALESCE(SUM(${usageRecords.cost}),0)`,
      requests: sql<number>`COUNT(*)`,
    })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        gte(usageRecords.createdAt, sevenDaysAgo),
      ),
    )
    .groupBy(sql`DATE_TRUNC('day', ${usageRecords.createdAt})`)
    .orderBy(sql`DATE_TRUNC('day', ${usageRecords.createdAt})`);

  // Build a map of isoDate -> row for quick lookup.
  const byDate = new Map<string, { cost: number; requests: number; date: string }>();
  for (const r of rows) {
    const iso = r.isoDate?.trim() ?? "";
    byDate.set(iso, {
      date: r.date.trim(),
      cost: Number(r.cost),
      requests: Number(r.requests),
    });
  }

  // Zero-fill all 7 days so the chart always shows Mon-Sun (or whatever
  // the 7-day window is) even when there is no usage on a given day. The
  // weekday label is derived from the ISO date so the client can relabel
  // it in the viewer's timezone (see usage-chart.tsx).
  const result: DailyUsage[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const iso = d.toISOString().slice(0, 10);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const existing = byDate.get(iso);
    result.push({
      date: weekday,
      isoDate: iso,
      cost: existing?.cost ?? 0,
      requests: existing?.requests ?? 0,
    });
  }

  return result;
}

/**
 * Get model breakdown (cost per model) for the current month.
 *
 * Same rationale as getWeeklyUsage, aggregates `usage_records` directly.
 */
export async function getModelBreakdown(
  userId: string,
): Promise<ModelBreakdownEntry[]> {
  if (!isDbAvailable()) return MOCK_MODEL_BREAKDOWN;

  const monthStart = startOfMonthUTC();

  const rows = await db
    .select({
      model: usageRecords.model,
      cost: sql<number>`COALESCE(SUM(${usageRecords.cost}),0)`,
    })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        gte(usageRecords.createdAt, monthStart),
      ),
    )
    .groupBy(usageRecords.model)
    .orderBy(sql`COALESCE(SUM(${usageRecords.cost}),0) DESC`);

  const total = rows.reduce((acc, r) => acc + Number(r.cost), 0);
  if (total === 0) return [];

  return rows.map((r) => ({
    model: r.model,
    cost: Number(r.cost),
    pct: Math.round((Number(r.cost) / total) * 100),
  }));
}

/**
 * Get the user's most recent usage records.
 */
export async function getRecentActivity(
  userId: string,
  limit = 10,
): Promise<RecentActivityEntry[]> {
  if (!isDbAvailable()) return MOCK_RECENT_ACTIVITY.slice(0, limit);

  const rows = await db
    .select({
      id: usageRecords.id,
      model: usageRecords.model,
      promptTokens: usageRecords.promptTokens,
      completionTokens: usageRecords.completionTokens,
      cacheReadTokens: usageRecords.cacheReadTokens,
      cost: usageRecords.cost,
      createdAt: usageRecords.createdAt,
      keyLabel: apiKeys.label,
    })
    .from(usageRecords)
    .leftJoin(apiKeys, eq(usageRecords.apiKeyId, apiKeys.id))
    .where(eq(usageRecords.userId, userId))
    .orderBy(desc(usageRecords.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    model: r.model,
    promptTokens: r.promptTokens,
    completionTokens: r.completionTokens,
    cacheReadTokens: r.cacheReadTokens ?? null,
    cost: r.cost,
    createdAt: r.createdAt,
    keyLabel: r.keyLabel ?? null,
  }));
}