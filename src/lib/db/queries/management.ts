/**
 * API key, usage, billing, and topup queries.
 *
 * Key management (get/create/revoke/update limits) is backed by Drizzle ORM
 * against the shared Postgres when DATABASE_URL is configured, and falls back
 * to static seed data when it is not (local dev without the DB running).
 * Usage and billing queries are still backed by static seed data.
 *
 * SECURITY: All functions take a `userId` that MUST come from the
 * authenticated session. Every query is scoped `.where(eq(table.userId,
 * userId))`. Ownership checks are enforced before any mutation.
 */

import { and, desc, eq } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { db, isDbAvailable } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { invalidateKeyCache } from "@/lib/key-cache";

// ── Types ──

export interface ApiKeyData {
  id: string;
  label: string;
  keyPrefix: string;
  rateLimitRpm: number;
  spendLimitDaily: string | null;
  spendLimitMonthly: string | null;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface UsageRecord {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: string;
  createdAt: Date;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
}

export interface TopupRecord {
  id: string;
  amount: string;
  method: string;
  fee: string;
  status: string;
  createdAt: Date;
}

export interface UsageFilters {
  model?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

// ── Mock seed data ──

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const MOCK_API_KEYS: ApiKeyData[] = [
  {
    id: "key-1",
    label: "Production",
    keyPrefix: "57d9725c",
    rateLimitRpm: 60,
    spendLimitDaily: "10.0000",
    spendLimitMonthly: "200.0000",
    isActive: true,
    lastUsed: new Date(NOW - 2 * 60 * 1000),
    createdAt: new Date(NOW - 14 * DAY),
    revokedAt: null,
  },
  {
    id: "key-2",
    label: "Test",
    keyPrefix: "a3f2b8e1",
    rateLimitRpm: 120,
    spendLimitDaily: null,
    spendLimitMonthly: null,
    isActive: true,
    lastUsed: new Date(NOW - 5 * 60 * 1000),
    createdAt: new Date(NOW - 7 * DAY),
    revokedAt: null,
  },
];

// Generate 40 mock usage records
function generateUsageRecords(): UsageRecord[] {
  const models = [
    "glm-5.2",
    "claude-sonnet-5",
    "deepseek-v4-flash",
    "gpt-5.4",
    "gpt-5.4-mini",
  ];
  const records: UsageRecord[] = [];
  for (let i = 0; i < 40; i++) {
    const model = models[i % models.length] ?? "glm-5.2";
    const promptTokens = 100 + Math.floor(Math.random() * 4000);
    const completionTokens = 50 + Math.floor(Math.random() * 3000);
    const baseCost =
      model === "glm-5.2"
        ? 0.000218
        : model === "claude-sonnet-5"
          ? 0.0017
          : model === "deepseek-v4-flash"
            ? 0.000027
            : model === "gpt-5.4"
              ? 0.001
              : 0.000315;
    const cost = (
      baseCost *
      (promptTokens + completionTokens) *
      0.001
    ).toFixed(6);
    records.push({
      id: `usage-${i + 1}`,
      model,
      promptTokens,
      completionTokens,
      cost,
      createdAt: new Date(NOW - i * 35 * 60 * 1000),
    });
  }
  return records;
}

const ALL_USAGE_RECORDS = generateUsageRecords();

const MOCK_TOPUPS: TopupRecord[] = [
  {
    id: "topup-1",
    amount: "25.00",
    method: "card",
    fee: "1.75",
    status: "completed",
    createdAt: new Date(NOW - 2 * DAY),
  },
  {
    id: "topup-2",
    amount: "10.00",
    method: "usdc",
    fee: "0.00",
    status: "completed",
    createdAt: new Date(NOW - 6 * DAY),
  },
  {
    id: "topup-3",
    amount: "50.00",
    method: "card",
    fee: "3.00",
    status: "completed",
    createdAt: new Date(NOW - 14 * DAY),
  },
];

// ── Keys queries ──

/** Map a Drizzle api_keys row to the dashboard's ApiKeyData shape. */
function rowToApiKey(row: typeof apiKeys.$inferSelect): ApiKeyData {
  return {
    id: row.id,
    label: row.label,
    keyPrefix: row.keyPrefix,
    rateLimitRpm: row.rateLimitRpm,
    spendLimitDaily: row.spendLimitDaily,
    spendLimitMonthly: row.spendLimitMonthly,
    isActive: row.isActive,
    lastUsed: row.lastUsedAt,
    createdAt: row.createdAt,
    revokedAt: row.revokedAt,
  };
}

export async function getApiKeys(userId: string): Promise<ApiKeyData[]> {
  if (!isDbAvailable()) return MOCK_API_KEYS.filter((k) => k.isActive);

  const rows = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt));

  return rows.map(rowToApiKey);
}

/**
 * Create a key: `rvcd_` + 32 random hex chars (128 bits). Only the SHA-256
 * hash is persisted; the full key is returned once and never retrievable.
 */
export async function createApiKey(
  userId: string,
  data: {
    label: string;
    rateLimitRpm: number;
    spendLimitDaily: string | null;
    spendLimitMonthly: string | null;
  },
): Promise<{ keyId: string; fullKey: string }> {
  const random = randomBytes(16).toString("hex"); // 32 hex chars
  const fullKey = `rvcd_${random}`;
  const keyHash = createHash("sha256").update(fullKey).digest("hex");
  const keyPrefix = random.substring(0, 8);
  const keyId = randomUUID();

  if (!isDbAvailable()) {
    MOCK_API_KEYS.push({
      id: keyId,
      label: data.label,
      keyPrefix,
      rateLimitRpm: data.rateLimitRpm,
      spendLimitDaily: data.spendLimitDaily,
      spendLimitMonthly: data.spendLimitMonthly,
      isActive: true,
      lastUsed: null,
      createdAt: new Date(),
      revokedAt: null,
    });
    return { keyId, fullKey };
  }

  await db.insert(apiKeys).values({
    id: keyId,
    userId,
    label: data.label,
    keyPrefix,
    keyHash,
    rateLimitRpm: data.rateLimitRpm,
    spendLimitDaily: data.spendLimitDaily,
    spendLimitMonthly: data.spendLimitMonthly,
  });

  return { keyId, fullKey };
}

/**
 * Revoke a key owned by `userId`: mark it inactive in Postgres, then delete
 * its Redis cache entry so the gateway stops accepting it immediately
 * instead of waiting out the 5 minute TTL.
 */
export async function revokeApiKey(
  userId: string,
  keyId: string,
): Promise<boolean> {
  if (!isDbAvailable()) {
    const key = MOCK_API_KEYS.find((k) => k.id === keyId && k.isActive);
    if (!key) return false;
    key.isActive = false;
    key.revokedAt = new Date();
    return true;
  }

  const [key] = await db
    .select({ keyHash: apiKeys.keyHash })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .limit(1);
  if (!key) return false;

  await db
    .update(apiKeys)
    .set({ isActive: false, revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

  await invalidateKeyCache(key.keyHash);
  return true;
}

/**
 * Update a key's label and limits. The Postgres row is the source of truth,
 * and the Redis cache entry is deleted so new limits apply on the next
 * gateway request instead of after the TTL.
 */
export async function updateApiKeyLimits(
  userId: string,
  keyId: string,
  data: {
    label: string;
    rateLimitRpm: number;
    spendLimitDaily: string | null;
    spendLimitMonthly: string | null;
  },
): Promise<boolean> {
  if (!isDbAvailable()) {
    const key = MOCK_API_KEYS.find((k) => k.id === keyId && k.isActive);
    if (!key) return false;
    key.label = data.label;
    key.rateLimitRpm = data.rateLimitRpm;
    key.spendLimitDaily = data.spendLimitDaily;
    key.spendLimitMonthly = data.spendLimitMonthly;
    return true;
  }

  const [key] = await db
    .select({ keyHash: apiKeys.keyHash })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .limit(1);
  if (!key) return false;

  await db
    .update(apiKeys)
    .set({
      label: data.label,
      rateLimitRpm: data.rateLimitRpm,
      spendLimitDaily: data.spendLimitDaily,
      spendLimitMonthly: data.spendLimitMonthly,
    })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

  await invalidateKeyCache(key.keyHash);
  return true;
}

// ── Usage queries ──

export async function getUsageRecords(
  userId: string,
  filters: UsageFilters,
): Promise<UsageRecord[]> {
  void userId;
  let records = [...ALL_USAGE_RECORDS];

  if (filters.model && filters.model !== "all") {
    records = records.filter((r) => r.model === filters.model);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    records = records.filter((r) => r.createdAt.getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    records = records.filter((r) => r.createdAt.getTime() <= to);
  }

  const offset = (filters.page - 1) * filters.pageSize;
  return records.slice(offset, offset + filters.pageSize);
}

export async function getUsageCount(
  userId: string,
  filters: Omit<UsageFilters, "page" | "pageSize">,
): Promise<number> {
  void userId;
  let records = [...ALL_USAGE_RECORDS];

  if (filters.model && filters.model !== "all") {
    records = records.filter((r) => r.model === filters.model);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    records = records.filter((r) => r.createdAt.getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    records = records.filter((r) => r.createdAt.getTime() <= to);
  }
  return records.length;
}

export async function getUsageSummary(
  userId: string,
  filters: Omit<UsageFilters, "page" | "pageSize">,
): Promise<UsageSummary> {
  void userId;
  let records = [...ALL_USAGE_RECORDS];

  if (filters.model && filters.model !== "all") {
    records = records.filter((r) => r.model === filters.model);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    records = records.filter((r) => r.createdAt.getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    records = records.filter((r) => r.createdAt.getTime() <= to);
  }

  return {
    totalRequests: records.length,
    totalTokens: records.reduce(
      (acc, r) => acc + r.promptTokens + r.completionTokens,
      0,
    ),
    totalCost: records.reduce((acc, r) => acc + Number(r.cost), 0),
  };
}

export async function getUniqueModels(userId: string): Promise<string[]> {
  void userId;
  return Array.from(new Set(ALL_USAGE_RECORDS.map((r) => r.model))).sort();
}

export async function getAllUsageForExport(
  userId: string,
  filters: Omit<UsageFilters, "page" | "pageSize">,
): Promise<UsageRecord[]> {
  void userId;
  let records = [...ALL_USAGE_RECORDS];

  if (filters.model && filters.model !== "all") {
    records = records.filter((r) => r.model === filters.model);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    records = records.filter((r) => r.createdAt.getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    records = records.filter((r) => r.createdAt.getTime() <= to);
  }
  return records;
}

// ── Billing / topup queries ──

export async function getTopups(userId: string): Promise<TopupRecord[]> {
  void userId;
  return [...MOCK_TOPUPS].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}
