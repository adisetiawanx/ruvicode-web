import { desc, eq, sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { apiKeys, usageRecords, user } from "@/lib/db/schema";

// Provider cost per row: actual_cost (wallet-true charge from the usage
// webhook, ADR-037) wins when present; market_cost is the marketplace-best
// estimate; upstream_cost only covers legacy rows written before either
// existed. costSource tells the UI which one it got.
const providerCostExpr = sql<number>`COALESCE(${usageRecords.actualCost}, CASE WHEN ${usageRecords.marketCost} > 0 THEN ${usageRecords.marketCost} ELSE ${usageRecords.upstreamCost} END, 0)`;
const costSourceExpr = sql<string>`CASE WHEN ${usageRecords.actualCost} IS NOT NULL THEN 'actual' ELSE 'est' END`;

export async function getAdminUsage() {
  if (!isDbAvailable()) return { rows: [], models: [], keys: [], volume: [] };
  const rows = await db.select({ id: usageRecords.id, model: usageRecords.model, userEmail: user.email, keyLabel: apiKeys.label, promptTokens: usageRecords.promptTokens, completionTokens: usageRecords.completionTokens, reasoningTokens: usageRecords.reasoningTokens, cacheReadTokens: usageRecords.cacheReadTokens, cost: usageRecords.cost, providerCost: providerCostExpr, costSource: costSourceExpr, status: usageRecords.status, requestId: usageRecords.requestId, createdAt: usageRecords.createdAt }).from(usageRecords).leftJoin(apiKeys, eq(apiKeys.id, usageRecords.apiKeyId)).leftJoin(user, eq(user.id, usageRecords.userId)).orderBy(desc(usageRecords.createdAt)).limit(100);
  const models = await db.select({ model: usageRecords.model, requests: sql<number>`COUNT(*)`, cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)`, providerCost: sql<number>`COALESCE(SUM(COALESCE(${usageRecords.actualCost}, CASE WHEN ${usageRecords.marketCost} > 0 THEN ${usageRecords.marketCost} ELSE ${usageRecords.upstreamCost} END, 0)), 0)`, actualCount: sql<number>`COUNT(${usageRecords.actualCost})` }).from(usageRecords).groupBy(usageRecords.model).orderBy(sql`COUNT(*) DESC`);
  const keys = await db.select({ keyLabel: apiKeys.label, requests: sql<number>`COUNT(*)`, cost: sql<number>`COALESCE(SUM(${usageRecords.cost}), 0)` }).from(usageRecords).leftJoin(apiKeys, eq(apiKeys.id, usageRecords.apiKeyId)).groupBy(apiKeys.label).orderBy(sql`COUNT(*) DESC`).limit(20);
  return { rows: rows.map((row) => ({ ...row, userEmail: row.userEmail ?? "Deleted user", promptTokens: Number(row.promptTokens), completionTokens: Number(row.completionTokens), reasoningTokens: Number(row.reasoningTokens ?? 0), cacheReadTokens: Number(row.cacheReadTokens ?? 0), cost: Number(row.cost), providerCost: Number(row.providerCost), costSource: row.costSource ?? "est", createdAt: new Date(row.createdAt).toISOString() })), models: models.map((row) => ({ model: row.model, requests: Number(row.requests), cost: Number(row.cost), providerCost: Number(row.providerCost), actualCount: Number(row.actualCount ?? 0) })), keys: keys.map((row) => ({ keyLabel: row.keyLabel ?? "Deleted key", requests: Number(row.requests), cost: Number(row.cost) })), volume: [] };
}
