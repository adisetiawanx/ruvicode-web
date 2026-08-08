/**
 * API key, usage, billing, and topup queries.
 *
 * Currently backed by static seed data (DB not running in local dev).
 * Will be swapped to Drizzle ORM queries once Postgres is provisioned.
 *
 * SECURITY: All functions take a `userId` that MUST come from the
 * authenticated session. When Drizzle is added, every query is scoped
 * `.where(eq(table.userId, userId))`. Ownership checks are enforced
 * before any mutation.
 */

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

export async function getApiKeys(userId: string): Promise<ApiKeyData[]> {
  void userId; // will be used in Drizzle where clause
  return MOCK_API_KEYS.filter((k) => k.isActive);
}

export async function createApiKey(
  userId: string,
  data: {
    label: string;
    rateLimitRpm: number;
    spendLimitDaily: string | null;
    spendLimitMonthly: string | null;
  },
): Promise<{ keyId: string; fullKey: string }> {
  void userId;
  // Generate key: rvcd_ + 32 random hex chars
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const fullKey = `rvcd_${random}`;
  const keyPrefix = random.substring(0, 8);
  const keyId = `key-${Date.now()}`;

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

export async function revokeApiKey(
  userId: string,
  keyId: string,
): Promise<boolean> {
  void userId;
  const key = MOCK_API_KEYS.find((k) => k.id === keyId && k.isActive);
  if (!key) return false;
  key.isActive = false;
  key.revokedAt = new Date();
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
