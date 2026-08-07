/**
 * Dashboard data queries.
 *
 * Currently backed by static seed data (DB not running in local dev).
 * Will be swapped to Drizzle ORM queries once Postgres is provisioned.
 * The query interface stays identical so the swap is a one-file change.
 *
 * SECURITY: All functions take a `userId` parameter that MUST come from the
 * authenticated session (session.user.id), never from client input. When
 * Drizzle is added, every query is scoped `.where(eq(table.userId, userId))`.
 */

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
  cost: string;
  createdAt: Date;
}

// ── Mock seed data ──
// Mirrors the Postgres schema from DESIGN.md §12.
// Replace with real queries when DB is provisioned.

const MOCK_WALLET: WalletData = {
  balance: "42.50",
  held: "0.00",
  totalLoaded: "85.00",
  totalSpent: "42.50",
};

const MOCK_MONTHLY_SPENT = 3.24;
const MOCK_MONTHLY_REQUESTS = 1247;
const MOCK_MONTHLY_SAVINGS = 8.91; // vs OpenRouter reference

const MOCK_WEEKLY_USAGE: DailyUsage[] = [
  { date: "Mon", cost: 0.42, requests: 180 },
  { date: "Tue", cost: 0.31, requests: 142 },
  { date: "Wed", cost: 0.88, requests: 321 },
  { date: "Thu", cost: 0.56, requests: 245 },
  { date: "Fri", cost: 0.72, requests: 298 },
  { date: "Sat", cost: 0.19, requests: 88 },
  { date: "Sun", cost: 0.16, requests: 73 },
];

const MOCK_MODEL_BREAKDOWN: ModelBreakdownEntry[] = [
  { model: "glm-5.2", cost: 1.2, pct: 37 },
  { model: "claude-sonnet-5", cost: 0.8, pct: 25 },
  { model: "deepseek-v4-flash", cost: 0.6, pct: 19 },
  { model: "gpt-5.4", cost: 0.4, pct: 12 },
  { model: "other", cost: 0.22, pct: 7 },
];

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;

const MOCK_RECENT_ACTIVITY: RecentActivityEntry[] = [
  {
    id: "rec-1",
    model: "glm-5.2",
    promptTokens: 320,
    completionTokens: 930,
    cost: "0.000231",
    createdAt: new Date(NOW - 2 * MIN),
  },
  {
    id: "rec-2",
    model: "claude-sonnet-5",
    promptTokens: 1200,
    completionTokens: 2200,
    cost: "0.013400",
    createdAt: new Date(NOW - 5 * MIN),
  },
  {
    id: "rec-3",
    model: "deepseek-v4-flash",
    promptTokens: 4100,
    completionTokens: 4800,
    cost: "0.000162",
    createdAt: new Date(NOW - 12 * MIN),
  },
  {
    id: "rec-4",
    model: "gpt-5.4",
    promptTokens: 850,
    completionTokens: 1150,
    cost: "0.001575",
    createdAt: new Date(NOW - 25 * MIN),
  },
  {
    id: "rec-5",
    model: "glm-5.2",
    promptTokens: 210,
    completionTokens: 540,
    cost: "0.000142",
    createdAt: new Date(NOW - 38 * MIN),
  },
  {
    id: "rec-6",
    model: "claude-sonnet-5",
    promptTokens: 3400,
    completionTokens: 5600,
    cost: "0.034200",
    createdAt: new Date(NOW - 1 * HOUR),
  },
  {
    id: "rec-7",
    model: "gpt-5.4",
    promptTokens: 720,
    completionTokens: 980,
    cost: "0.001364",
    createdAt: new Date(NOW - 1.5 * HOUR),
  },
  {
    id: "rec-8",
    model: "deepseek-v4-flash",
    promptTokens: 2600,
    completionTokens: 3100,
    cost: "0.000097",
    createdAt: new Date(NOW - 2 * HOUR),
  },
  {
    id: "rec-9",
    model: "glm-5.2",
    promptTokens: 180,
    completionTokens: 420,
    cost: "0.000108",
    createdAt: new Date(NOW - 3 * HOUR),
  },
  {
    id: "rec-10",
    model: "claude-sonnet-5",
    promptTokens: 950,
    completionTokens: 1800,
    cost: "0.010850",
    createdAt: new Date(NOW - 4 * HOUR),
  },
];

// ── Query functions ──

export async function getWallet(_userId: string): Promise<WalletData> {
  return MOCK_WALLET;
}

export async function getMonthlySummary(
  _userId: string,
): Promise<MonthlySummary> {
  return {
    spent: MOCK_MONTHLY_SPENT,
    requestCount: MOCK_MONTHLY_REQUESTS,
    savings: MOCK_MONTHLY_SAVINGS,
  };
}

export async function getWeeklyUsage(_userId: string): Promise<DailyUsage[]> {
  return MOCK_WEEKLY_USAGE;
}

export async function getModelBreakdown(
  _userId: string,
): Promise<ModelBreakdownEntry[]> {
  return MOCK_MODEL_BREAKDOWN;
}

export async function getRecentActivity(
  _userId: string,
  limit = 10,
): Promise<RecentActivityEntry[]> {
  return MOCK_RECENT_ACTIVITY.slice(0, limit);
}
