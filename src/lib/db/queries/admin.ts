import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import {
  apiKeys,
  depositAddresses,
  topups,
  usageRecords,
  user,
  wallets,
} from "@/lib/db/schema";
import { desc, eq, gte } from "drizzle-orm";

export interface AdminAuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  operationId: string | null;
  status: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAddressBalance {
  address: string;
  userId: string | null;
  usdc: number;
  eth: number;
  gasReady: boolean;
  status: string;
}

const emptyAudit: AdminAuditEntry[] = [];

/** Env value that treats an empty or whitespace-only string as unset. */
export function envValue(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function utcStart(daysAgo: number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - daysAgo);
  return start;
}

function zeroFilledDays(days: number) {
  const result: { isoDate: string; date: string; count: number; cost: number }[] = [];
  const start = utcStart(days - 1);
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    result.push({
      isoDate: date.toISOString().slice(0, 10),
      date: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      count: 0,
      cost: 0,
    });
  }
  return result;
}

export async function getAdminUserStats() {
  if (!isDbAvailable()) return { total: 0, active7d: 0, signups7d: zeroFilledDays(7).map((d) => ({ ...d, count: 0 })) };

  const [totalRow, activeRow] = await Promise.all([
    db.select({ total: sql<number>`COUNT(*)` }).from(user),
    db
      .select({ count: sql<number>`COUNT(DISTINCT ${usageRecords.userId})` })
      .from(usageRecords)
      .where(gte(usageRecords.createdAt, utcStart(7))),
  ]);
  const signupRows = await db
    .select({ isoDate: sql<string>`TO_CHAR(DATE_TRUNC('day', ${user.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`, count: sql<number>`COUNT(*)` })
    .from(user)
    .where(gte(user.createdAt, utcStart(7)))
    .groupBy(sql`DATE_TRUNC('day', ${user.createdAt} AT TIME ZONE 'UTC')`);

  const days = zeroFilledDays(7).map((day) => ({ ...day, count: 0 }));
  for (const row of signupRows) {
    const target = days.find((day) => day.isoDate === row.isoDate);
    if (target) target.count = Number(row.count);
  }
  return { total: Number(totalRow[0]?.total ?? 0), active7d: Number(activeRow[0]?.count ?? 0), signups7d: days };
}

export async function getAdminRevenue() {
  if (!isDbAvailable()) return { today: 0, week: 0, month: 0, chargesToday: 0, marginPct: 0, perModel: [] as AdminModelProfitability[] };
  const periods = [utcStart(1), utcStart(7), new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))];
  const rows = await Promise.all(periods.map((start) => db.select({ charges: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`, margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)` }).from(usageRecords).where(gte(usageRecords.createdAt, start))));
  const [today = { charges: 0, margin: 0 }, week = { charges: 0, margin: 0 }, month = { charges: 0, margin: 0 }] = rows.map((row) => ({ charges: Number(row[0]?.charges ?? 0), margin: Number(row[0]?.margin ?? 0) }));
  const modelRows = await db.select({ model: usageRecords.model, requests: sql<number>`COUNT(*)`, userCost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`, upstreamCost: sql<number>`COALESCE(SUM(${usageRecords.upstreamCost}), 0)`, margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)` }).from(usageRecords).groupBy(usageRecords.model).orderBy(sql`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0) DESC`);
  const perModel = modelRows.map((row) => {
    const userCost = Number(row.userCost);
    const margin = Number(row.margin);
    const marginPct = userCost > 0 ? (margin / userCost) * 100 : 0;
    return { model: row.model, requests: Number(row.requests), userCost, upstreamCost: Number(row.upstreamCost), margin, marginPct, status: margin < 0 ? "negative" : marginPct < 10 ? "thin" : "healthy" };
  });
  return { today: today.margin, week: week.margin, month: month.margin, chargesToday: today.charges, marginPct: today.charges > 0 ? (today.margin / today.charges) * 100 : 0, perModel };
}

export interface AdminModelProfitability { model: string; requests: number; userCost: number; upstreamCost: number; margin: number; marginPct: number; status: string }

export async function getAdminDeposits() {
  if (!isDbAvailable()) return { totalUsdc: 0, totalPaddle: 0, pending: 0, failed: 0, recent: [] as AdminDeposit[] };
  const [usdc, paddle, pending, failed, recent] = await Promise.all([
    db.select({ total: sql<number>`COALESCE(SUM(${topups.amount}), 0)` }).from(topups).where(eq(topups.method, "usdc")),
    db.select({ total: sql<number>`COALESCE(SUM(${topups.amount}), 0)` }).from(topups).where(eq(topups.method, "paddle")),
    db.select({ total: sql<number>`COUNT(*)` }).from(topups).where(eq(topups.status, "pending")),
    db.select({ total: sql<number>`COUNT(*)` }).from(topups).where(eq(topups.status, "failed")),
    db.select({ userId: topups.userId, amount: topups.amount, method: topups.method, status: topups.status, createdAt: topups.createdAt }).from(topups).orderBy(desc(topups.createdAt)).limit(10),
  ]);
  return { totalUsdc: Number(usdc[0]?.total ?? 0), totalPaddle: Number(paddle[0]?.total ?? 0), pending: Number(pending[0]?.total ?? 0), failed: Number(failed[0]?.total ?? 0), recent: recent.map((row) => ({ userId: row.userId, amount: Number(row.amount), method: row.method, status: row.status, createdAt: new Date(row.createdAt).toISOString() })) };
}

export interface AdminDeposit { userId: string | null; amount: number; method: string; status: string; createdAt: string }

export interface AdminChainData { available: boolean; error?: string; float: number; treasuryUsdc: number; liability: number; held: number; ratio: number | null; treasuryEth: number; treasury: string; addresses: AdminAddressBalance[] }

export async function getAdminFloatVsLiability(rpcUrl: string, usdcContract: string, treasury: string) {
  if (!isDbAvailable()) return { available: false, error: "Database unavailable", float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null, treasuryEth: 0, treasury, addresses: [] } satisfies AdminChainData;
  const [liabilityRow, addressRows] = await Promise.all([
    db.select({ balance: sql<number>`COALESCE(SUM(${wallets.balance}), 0)`, held: sql<number>`COALESCE(SUM(${wallets.held}), 0)` }).from(wallets),
    db.select({ address: depositAddresses.address, userId: depositAddresses.userId }).from(depositAddresses),
  ]);
  try {
    const balances = await Promise.all(addressRows.map(async (row) => ({ address: row.address, userId: row.userId, usdc: await getTokenBalance(rpcUrl, usdcContract, row.address), eth: await getNativeBalance(rpcUrl, row.address) })));
    const treasuryUsdc = await getTokenBalance(rpcUrl, usdcContract, treasury);
    const treasuryEth = await getNativeBalance(rpcUrl, treasury);
    const float = treasuryUsdc + balances.reduce((sum, row) => sum + row.usdc, 0);
    const liability = Number(liabilityRow[0]?.balance ?? 0);
    return { available: true, float, treasuryUsdc, liability, held: Number(liabilityRow[0]?.held ?? 0), ratio: liability > 0 ? float / liability : null, treasuryEth, treasury, addresses: balances.map((row) => ({ ...row, gasReady: row.eth >= 0.0005, status: row.eth >= 0.0005 ? "ready" : "needs_gas" })) } satisfies AdminChainData;
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : "RPC unavailable", float: 0, treasuryUsdc: 0, liability: Number(liabilityRow[0]?.balance ?? 0), held: Number(liabilityRow[0]?.held ?? 0), ratio: null, treasuryEth: 0, treasury, addresses: [] } satisfies AdminChainData;
  }
}

async function rpc(rpcUrl: string, method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }), signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error("RPC request failed");
  return json.result as string;
}

const chainNotConfigured: AdminChainData = { available: false, error: "Treasury is not configured", float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null, treasuryEth: 0, treasury: "", addresses: [] };
const chainTimedOut: AdminChainData = { available: false, error: "Chain data unavailable", float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null, treasuryEth: 0, treasury: "", addresses: [] };

/** Chain overview for the admin console; never rejects and never blocks the page beyond `ms`. */
export async function getAdminChainData(ms = 8_000): Promise<AdminChainData> {
  const treasury = envValue("TREASURY_ADDRESS", "");
  if (!treasury) return chainNotConfigured;
  const rpcUrl = envValue("BASE_RPC_URL", "https://mainnet.base.org");
  const contract = envValue("USDC_CONTRACT", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  const guarded = getAdminFloatVsLiability(rpcUrl, contract, treasury).catch(() => chainTimedOut);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<AdminChainData>((resolve) => { timer = setTimeout(() => resolve(chainTimedOut), ms); });
  try {
    return await Promise.race([guarded, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function getTokenBalance(rpcUrl: string, contract: string, address: string) {
  const data = `0x70a08231${"0".repeat(24)}${address.replace(/^0x/, "").toLowerCase()}`;
  const raw = BigInt(await rpc(rpcUrl, "eth_call", [{ to: contract, data }, "latest"]));
  return Number(raw) / 1_000_000;
}

async function getNativeBalance(rpcUrl: string, address: string) {
  return Number(BigInt(await rpc(rpcUrl, "eth_getBalance", [address, "latest"]))) / 1e18;
}

export async function getAdminOps() {
  if (!isDbAvailable()) return { volume7d: zeroFilledDays(7), topKeys: [] as AdminTopKey[] };
  const rows = await db.select({ isoDate: sql<string>`TO_CHAR(DATE_TRUNC('day', ${usageRecords.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`, count: sql<number>`COUNT(*)`, cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)` }).from(usageRecords).where(gte(usageRecords.createdAt, utcStart(7))).groupBy(sql`DATE_TRUNC('day', ${usageRecords.createdAt} AT TIME ZONE 'UTC')`);
  const volume7d = zeroFilledDays(7);
  for (const row of rows) { const day = volume7d.find((item) => item.isoDate === row.isoDate); if (day) { day.count = Number(row.count); day.cost = Number(row.cost); } }
  const topKeys = await db.select({ keyId: usageRecords.apiKeyId, label: apiKeys.label, requests: sql<number>`COUNT(*)`, spend: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)` }).from(usageRecords).leftJoin(apiKeys, eq(apiKeys.id, usageRecords.apiKeyId)).groupBy(usageRecords.apiKeyId, apiKeys.label).orderBy(sql`COALESCE(SUM(${usageRecords.cost}), 0) DESC`).limit(5);
  return { volume7d, topKeys: topKeys.map((row) => ({ keyId: row.keyId, label: row.label, requests: Number(row.requests), spend: Number(row.spend) })) };
}

export interface AdminTopKey { keyId: string | null; label: string | null; requests: number; spend: number }

export async function getAdminAuditLog(limit = 5): Promise<AdminAuditEntry[]> {
  if (!isDbAvailable()) return emptyAudit;
  const rows = await db.execute(sql`SELECT id, admin_email, action, operation_id, status, details, created_at FROM admin_audit_log ORDER BY created_at DESC LIMIT ${limit}`);
  return (rows.rows as Record<string, unknown>[]).map((row) => ({ id: String(row.id), adminEmail: String(row.admin_email), action: String(row.action), operationId: row.operation_id ? String(row.operation_id) : null, status: String(row.status), details: (row.details as Record<string, unknown>) ?? {}, createdAt: new Date(String(row.created_at)).toISOString() }));
}
