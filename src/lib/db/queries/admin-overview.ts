import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { envValue, getAdminChainData, getAdminOps, getAdminRevenue, getAdminUserStats, type AdminChainData } from "./admin";

export type AdminHealthState = "Healthy" | "Warning" | "Unavailable" | "Unknown";
export interface AdminHealthItem { name: string; state: AdminHealthState; detail?: string }

async function checkRedis(): Promise<AdminHealthState> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return "Unknown";
  try {
    const { default: Redis } = await import("ioredis");
    const redis = new Redis(url, { connectTimeout: 1500, lazyConnect: true, retryStrategy: null, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    try {
      if (redis.status === "wait") await redis.connect();
      const pong = await redis.ping();
      return pong === "PONG" ? "Healthy" : "Unavailable";
    } finally {
      redis.disconnect();
    }
  } catch {
    return "Unavailable";
  }
}

async function checkGateway(): Promise<AdminHealthState> {
  const base = envValue("GATEWAY_INTERNAL_URL", "");
  if (!base) return "Unknown";
  try {
    const response = await fetch(`${base.replace(/\/+$/, "")}/health`, { signal: AbortSignal.timeout(3000), cache: "no-store" });
    if (!response.ok) return "Unavailable";
    const data = (await response.json()) as { status?: string };
    return data?.status === "ok" ? "Healthy" : "Unavailable";
  } catch {
    return "Unavailable";
  }
}

async function checkDatabase(): Promise<AdminHealthState> {
  try {
    if (!isDbAvailable()) return "Unavailable";
    await db.execute(sql`SELECT 1`);
    return "Healthy";
  } catch {
    return "Unavailable";
  }
}

function ageMinutes(value: unknown): number | null {
  if (!value) return null;
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.round((Date.now() - time) / 60000));
}

async function checkPricingSync(): Promise<AdminHealthItem> {
  try {
    const result = await db.execute(sql`SELECT MAX(updated_at) AS t FROM model_prices`);
    const age = ageMinutes((result.rows[0] as Record<string, unknown> | undefined)?.t);
    return age === null
      ? { name: "Pricing sync", state: "Warning", detail: "Never synced" }
      : { name: "Pricing sync", state: age > 10 ? "Warning" : "Healthy", detail: `${age} min ago` };
  } catch {
    return { name: "Pricing sync", state: "Unavailable" };
  }
}

async function checkDepositMonitor(): Promise<AdminHealthItem> {
  try {
    const result = await db.execute(sql`SELECT updated_at AS t FROM monitor_cursor ORDER BY id DESC LIMIT 1`);
    const age = ageMinutes((result.rows[0] as Record<string, unknown> | undefined)?.t);
    return age === null
      ? { name: "Deposit monitor", state: "Warning", detail: "No scan recorded" }
      : { name: "Deposit monitor", state: age > 5 ? "Warning" : "Healthy", detail: `${age} min ago` };
  } catch {
    return { name: "Deposit monitor", state: "Unavailable" };
  }
}

export async function getAdminHealth(chain: AdminChainData): Promise<AdminHealthItem[]> {
  const [database, redis, gateway, pricing, monitor] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkGateway(),
    checkPricingSync(),
    checkDepositMonitor(),
  ]);
  const emptyChainUsed = chain.available ? undefined : chain.error;
  // Treasury gas only matters when there are USDC deposits to sweep.
  const hasSweepableUsdc = chain.available && chain.addresses.some((a) => a.usdc > 0);
  const treasuryGas: AdminHealthItem = !chain.available
    ? { name: "Treasury gas", state: "Unknown", detail: emptyChainUsed }
    : hasSweepableUsdc
      ? { name: "Treasury gas", state: chain.treasuryEth >= 0.005 ? "Healthy" : "Warning", detail: `${chain.treasuryEth.toFixed(4)} ETH` }
      : { name: "Treasury gas", state: "Healthy", detail: `${chain.treasuryEth.toFixed(4)} ETH` };
  return [
    { name: "Database", state: database },
    { name: "Redis", state: redis },
    { name: "Gateway", state: gateway },
    pricing,
    monitor,
    treasuryGas,
  ];
}

export async function getAdminOverview() {
  const chainPromise = getAdminChainData();
  const [users, revenue, ops, chain, health] = await Promise.all([
    getAdminUserStats(),
    getAdminRevenue(),
    getAdminOps(),
    chainPromise,
    chainPromise.then((resolved) => getAdminHealth(resolved)),
  ]);
  return { users, revenue, ops, chain, health };
}
