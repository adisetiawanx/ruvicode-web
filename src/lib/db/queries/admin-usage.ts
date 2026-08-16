import { desc, eq, sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { apiKeys, usageRecords } from "@/lib/db/schema";

export async function getAdminUsage() {
  if (!isDbAvailable()) return { rows: [], models: [], keys: [], volume: [] };
  const rows = await db.select({ id: usageRecords.id, model: usageRecords.model, keyLabel: apiKeys.label, promptTokens: usageRecords.promptTokens, completionTokens: usageRecords.completionTokens, reasoningTokens: usageRecords.reasoningTokens, cost: usageRecords.cost, upstreamCost: usageRecords.upstreamCost, status: usageRecords.status, requestId: usageRecords.requestId, createdAt: usageRecords.createdAt }).from(usageRecords).leftJoin(apiKeys, eq(apiKeys.id, usageRecords.apiKeyId)).orderBy(desc(usageRecords.createdAt)).limit(100);
  const models = await db.select({ model: usageRecords.model, requests: sql<number>`COUNT(*)`, cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`, upstreamCost: sql<number>`COALESCE(SUM(${usageRecords.upstreamCost}), 0)` }).from(usageRecords).groupBy(usageRecords.model).orderBy(sql`COUNT(*) DESC`);
  const keys = await db.select({ keyLabel: apiKeys.label, requests: sql<number>`COUNT(*)`, cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)` }).from(usageRecords).leftJoin(apiKeys, eq(apiKeys.id, usageRecords.apiKeyId)).groupBy(apiKeys.label).orderBy(sql`COUNT(*) DESC`).limit(20);
  return { rows: rows.map((row) => ({ ...row, promptTokens: Number(row.promptTokens), completionTokens: Number(row.completionTokens), reasoningTokens: Number(row.reasoningTokens ?? 0), cost: Number(row.cost), upstreamCost: Number(row.upstreamCost), createdAt: new Date(row.createdAt).toISOString() })), models: models.map((row) => ({ model: row.model, requests: Number(row.requests), cost: Number(row.cost), upstreamCost: Number(row.upstreamCost) })), keys: keys.map((row) => ({ keyLabel: row.keyLabel ?? "Deleted key", requests: Number(row.requests), cost: Number(row.cost) })), volume: [] };
}
