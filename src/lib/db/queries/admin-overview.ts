import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { getAdminRevenue, getAdminUserStats, getAdminOps, getAdminFloatVsLiability, type AdminChainData } from "./admin";

export type AdminHealthState = "Healthy" | "Warning" | "Unavailable" | "Unknown";
export interface AdminHealthItem { name: string; state: AdminHealthState; detail?: string }

const emptyChain: AdminChainData = { available: false, error: "Treasury is not configured", float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null, treasuryEth: 0, treasury: "", addresses: [] };

async function checkRedis(): Promise<AdminHealthState> {
  const url = process.env.REDIS_URL;
  if (!url) return "Unknown";
  try {
    const { default: Redis } = await import("ioredis");
    const redis = new Redis(url, { connectTimeout: 2000, retryStrategy: () => null, maxRetriesPerRequest: 0, enableOfflineQueue: false });
    const pong = await redis.ping();
    redis.disconnect();
    return pong === "PONG" ? "Healthy" : "Unavailable";
  } catch {
    return "Unavailable";
  }
}

async function checkGateway(): Promise<AdminHealthState> {
  const base = (process.env.GATEWAY_INTERNAL_URL ?? "").replace(/\/+$/, "");
  if (!base) return "Unknown";
  try {
    const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000), cache: "no-store" });
    if (!response.ok) return "Unavailable";
    const data = (await response.json()) as { status?: string };
    return data?.status === "ok" ? "Healthy" : "Unavailable";
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

export async function getAdminHealth(chain: AdminChainData): Promise<AdminHealthItem[]> {
  const items: AdminHealthItem[] = [];
  let dbState: AdminHealthState = "Unavailable";
  try {
    if (isDbAvailable()) {
      await db.execute(sql`SELECT 1`);
      dbState = "Healthy";
    }
  } catch {
    dbState = "Unavailable";
  }
  items.push({ name: "Database", state: dbState });
  items.push({ name: "Redis", state: await checkRedis() });
  items.push({ name: "Gateway", state: await checkGateway() });

  let pricing: AdminHealthItem = { name: "Pricing sync", state: "Unknown" };
  try {
    const result = await db.execute(sql`SELECT MAX(updated_at) AS t FROM model_prices`);
    const age = ageMinutes((result.rows[0] as Record<string, unknown> | undefined)?.t);
    pricing = age === null ? { name: "Pricing sync", state: "Warning", detail: "Never synced" } : { name: "Pricing sync", state: age > 10 ? "Warning" : "Healthy", detail: `${age} min ago` };
  } catch {
    pricing = { name: "Pricing sync", state: "Unavailable" };
  }
  items.push(pricing);

  let monitor: AdminHealthItem = { name: "Deposit monitor", state: "Unknown" };
  try {
    const result = await db.execute(sql`SELECT updated_at AS t FROM monitor_cursor ORDER BY id DESC LIMIT 1`);
    const age = ageMinutes((result.rows[0] as Record<string, unknown> | undefined)?.t);
    monitor = age === null ? { name: "Deposit monitor", state: "Warning", detail: "No scan recorded" } : { name: "Deposit monitor", state: age > 5 ? "Warning" : "Healthy", detail: `${age} min ago` };
  } catch {
    monitor = { name: "Deposit monitor", state: "Unavailable" };
  }
  items.push(monitor);

  items.push({
    name: "Treasury gas",
    state: chain.available ? (chain.treasuryEth >= 0.005 ? "Healthy" : "Warning") : "Unknown",
    detail: chain.available ? `${chain.treasuryEth.toFixed(4)} ETH` : undefined,
  });
  return items;
}

export async function getAdminOverview() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const contract = process.env.USDC_CONTRACT ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const treasury = process.env.TREASURY_ADDRESS ?? "";
  const chain = treasury ? await getAdminFloatVsLiability(rpcUrl, contract, treasury) : emptyChain;
  const [users, revenue, ops, health] = await Promise.all([
    getAdminUserStats(),
    getAdminRevenue(),
    getAdminOps(),
    getAdminHealth(chain),
  ]);
  return { users, revenue, ops, chain, health };
}
