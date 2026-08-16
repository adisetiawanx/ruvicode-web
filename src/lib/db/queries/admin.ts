/**
 * Admin-only analytics queries (ADR-024).
 *
 * All functions assume the caller has already verified admin access
 * (email allowlist in the admin layout). No auth checks here.
 */

import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { user, usageRecords, topups, wallets, depositAddresses } from "@/lib/db/schema";
import { eq, gte, desc, count } from "drizzle-orm";

// ─── Users ─────────────────────────────────────────────────────────

export async function getAdminUserStats() {
  if (!isDbAvailable()) return { total: 0, active7d: 0, signups7d: [] as { date: string; count: number }[] };

  const [totalRow] = await db.select({ total: count() }).from(user);
  const total = totalRow?.total ?? 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [activeRow] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${usageRecords.userId})` })
    .from(usageRecords)
    .where(gte(usageRecords.createdAt, sevenDaysAgo));
  const active7d = Number(activeRow?.count ?? 0);

  const signupRows = await db
    .select({
      date: sql<string>`TO_CHAR(DATE_TRUNC('day', ${user.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(user)
    .where(gte(user.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE_TRUNC('day', ${user.createdAt})`)
    .orderBy(sql`DATE_TRUNC('day', ${user.createdAt})`);

  return {
    total,
    active7d,
    signups7d: signupRows.map((r) => ({ date: r.date, count: Number(r.count) })),
  };
}

// ─── Revenue ──────────────────────────────────────────────────────

export async function getAdminRevenue() {
  if (!isDbAvailable()) return { today: 0, week: 0, month: 0, perModel: [] as any[] };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayRow] = await db
    .select({ margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)` })
    .from(usageRecords)
    .where(gte(usageRecords.createdAt, todayStart));
  const [weekRow] = await db
    .select({ margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)` })
    .from(usageRecords)
    .where(gte(usageRecords.createdAt, weekStart));
  const [monthRow] = await db
    .select({ margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)` })
    .from(usageRecords)
    .where(gte(usageRecords.createdAt, monthStart));

  const modelRows = await db
    .select({
      model: usageRecords.model,
      requests: sql<number>`COUNT(*)`,
      userCost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`,
      upstreamCost: sql<number>`COALESCE(SUM(${usageRecords.upstreamCost}), 0)`,
      margin: sql<number>`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0)`,
    })
    .from(usageRecords)
    .groupBy(usageRecords.model)
    .orderBy(sql`COALESCE(SUM(${usageRecords.cost} - ${usageRecords.upstreamCost}), 0) DESC`);

  const perModel = modelRows.map((r) => {
    const margin = Number(r.margin);
    const userCost = Number(r.userCost);
    const marginPct = userCost > 0 ? (margin / userCost) * 100 : 0;
    return {
      model: r.model,
      requests: Number(r.requests),
      userCost,
      upstreamCost: Number(r.upstreamCost),
      margin,
      marginPct,
      status: margin < 0 ? "negative" : marginPct < 10 ? "thin" : "healthy",
    };
  });

  return {
    today: Number(todayRow?.margin ?? 0),
    week: Number(weekRow?.margin ?? 0),
    month: Number(monthRow?.margin ?? 0),
    perModel,
  };
}

// ─── Deposits ──────────────────────────────────────────────────────

export async function getAdminDeposits() {
  if (!isDbAvailable()) return { totalUsdc: 0, totalPaddle: 0, recent: [] as any[] };

  const [usdcRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(${topups.amount}), 0)` })
    .from(topups)
    .where(eq(topups.method, "usdc" as any));
  const [paddleRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(${topups.amount}), 0)` })
    .from(topups)
    .where(eq(topups.method, "paddle" as any));

  const recentRows = await db
    .select({
      userId: topups.userId,
      amount: topups.amount,
      method: topups.method,
      status: topups.status,
      createdAt: topups.createdAt,
    })
    .from(topups)
    .orderBy(desc(topups.createdAt))
    .limit(10);

  return {
    totalUsdc: Number(usdcRow?.total ?? 0),
    totalPaddle: Number(paddleRow?.total ?? 0),
    recent: recentRows.map((r) => ({
      userId: r.userId,
      amount: Number(r.amount),
      method: r.method,
      status: r.status,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    })),
  };
}

// ─── Float vs Liability ─────────────────────────────────────────────

export async function getAdminFloatVsLiability(rpcUrl: string, usdcContract: string) {
  if (!isDbAvailable()) return { float: 0, liability: 0, ratio: 0, treasuryEth: 0, addresses: [] as any[] };

  // Liability: sum of all wallet balances
  const [liabilityRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(${wallets.balance}), 0)` })
    .from(wallets);
  const liability = Number(liabilityRow?.total ?? 0);

  // Float: sum of USDC on-chain across all deposit addresses
  const addrRows = await db
    .select({ address: depositAddresses.address, userId: depositAddresses.userId })
    .from(depositAddresses);

  let float = 0;
  const addressBalances: { address: string; userId: string | null; usdc: number }[] = [];

  for (const row of addrRows) {
    if (!row.address) continue;
    try {
      const bal = await getUsdcBalance(rpcUrl, usdcContract, row.address);
      float += bal;
      addressBalances.push({ address: row.address, userId: row.userId, usdc: bal });
    } catch {
      addressBalances.push({ address: row.address, userId: row.userId, usdc: 0 });
    }
  }

  const ratio = liability > 0 ? float / liability : 0;

  return {
    float,
    liability,
    ratio,
    treasuryEth: 0, // TODO: RPC call to treasury address
    addresses: addressBalances,
  };
}

// ─── Operations ─────────────────────────────────────────────────────

export async function getAdminOps() {
  if (!isDbAvailable()) return { volume7d: [] as any[], topKeys: [] as any[] };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const volumeRows = await db
    .select({
      date: sql<string>`TO_CHAR(DATE_TRUNC('day', ${usageRecords.createdAt}), 'Dy')`,
      count: sql<number>`COUNT(*)`,
      cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`,
    })
    .from(usageRecords)
    .where(gte(usageRecords.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE_TRUNC('day', ${usageRecords.createdAt})`)
    .orderBy(sql`DATE_TRUNC('day', ${usageRecords.createdAt})`);

  const topKeyRows = await db
    .select({
      keyId: usageRecords.apiKeyId,
      model: sql<string>`COUNT(DISTINCT ${usageRecords.model})`,
      requests: sql<number>`COUNT(*)`,
      spend: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`,
    })
    .from(usageRecords)
    .groupBy(usageRecords.apiKeyId)
    .orderBy(sql`COALESCE(SUM(${usageRecords.cost}), 0) DESC`)
    .limit(5);

  return {
    volume7d: volumeRows.map((r) => ({ date: r.date, count: Number(r.count), cost: Number(r.cost) })),
    topKeys: topKeyRows.map((r) => ({
      keyId: r.keyId,
      models: Number(r.model),
      requests: Number(r.requests),
      spend: Number(r.spend),
    })),
  };
}

// ─── RPC helper ────────────────────────────────────────────────────

async function getUsdcBalance(rpcUrl: string, usdcContract: string, address: string): Promise<number> {
  const data = "0x70a08231" + "0".repeat(24) + address.slice(2).toLowerCase();
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: usdcContract, data }, "latest"],
      id: 1,
    }),
  });
  const json = await res.json();
  const hex = json.result ?? "0x0";
  return parseInt(hex, 16) / 1e6;
}
