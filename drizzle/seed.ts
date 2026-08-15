/**
 * Database seed script (ADR-013 §5).
 *
 * Seeds development data for local testing:
 * - 1 test user (test@ruvicode.com)
 * - 1 wallet ($25.50 balance)
 * - 1 API key (rvcd_testkey... for gateway testing)
 * - 18 model prices (from seed-data.ts)
 * - 20 sample usage records (for dashboard charts)
 *
 * Usage: pnpm db:seed
 * Requires: DATABASE_URL env var + running Postgres (docker compose up -d)
 */

import { db } from "@/lib/db";
import {
  user,
  wallets,
  apiKeys,
  modelPrices,
  usageRecords,
} from "@/lib/db/schema";
import { MODEL_PRICES } from "@/lib/db/seed-data";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function seed() {
  console.log("🌱 Seeding development data...\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Start Postgres first:");
    console.error("   docker compose up -d");
    process.exit(1);
  }

  // ── Test user ──
  const testUserId = "test-user-001";
  console.log("  → Creating test user...");
  await db
    .insert(user)
    .values({
      id: testUserId,
      email: "test@ruvicode.com",
      emailVerified: true,
      name: "Test User",
    })
    .onConflictDoNothing();

  // ── Wallet ──
  console.log("  → Creating wallet ($25.50)...");
  await db
    .insert(wallets)
    .values({
      userId: testUserId,
      balance: "25.50",
      held: "0",
      // totalLoaded/totalSpent recomputed after usage records below so the
      // dashboard stats stay consistent (balance + spent = loaded).
      totalLoaded: "25.50",
      totalSpent: "0",
    })
    .onConflictDoNothing();

  // ── API key (for testing gateway) ──
  console.log("  → Creating test API key...");
  const testKey = "rvcd_testkey0001testkey0001testkey00";
  const keyHash = crypto.createHash("sha256").update(testKey).digest("hex");
  const apiKeyId = crypto.randomUUID();

  // Check if key already exists
  const [existingKey] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!existingKey) {
    await db.insert(apiKeys).values({
      id: apiKeyId,
      userId: testUserId,
      label: "Test Key",
      keyPrefix: "testkey0",
      keyHash,
      rateLimitRpm: 60,
    });
  }

  // Get the API key ID (either newly created or existing)
  const [keyRow] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  const finalApiKeyId = keyRow?.id ?? apiKeyId;

  // ── Model prices (from static seed data) ──
  console.log(`  → Seeding ${MODEL_PRICES.length} model prices...`);
  for (const m of MODEL_PRICES) {
    await db
      .insert(modelPrices)
      .values({
        model: m.model,
        displayName: m.display_name,
        provider: m.provider,
        refInput: m.ref_input.toString(),
        refOutput: m.ref_output.toString(),
        providerInput: (m.ref_input * (1 - m.discount_pct / 100)).toFixed(6),
        providerOutput: (m.ref_output * (1 - m.discount_pct / 100)).toFixed(6),
        userInput: m.user_input.toString(),
        userOutput: m.user_output.toString(),
        discountPct: m.discount_pct.toString(),
        userDiscountPct: m.user_discount_pct.toString(),
        isActive: m.is_active,
      })
      .onConflictDoNothing();
  }

  // ── Sample usage records (for dashboard charts) ──
  console.log("  → Creating 20 sample usage records...");
  const models = ["glm-5.2", "claude-sonnet-5", "gpt-5.4", "deepseek-v4-flash"];
  for (let i = 0; i < 20; i++) {
    const model = models[i % models.length] ?? "glm-5.2";
    const promptTokens = Math.floor(Math.random() * 5000) + 100;
    const completionTokens = Math.floor(Math.random() * 2000) + 50;

    // Base cost per model (from seed data)
    const baseCosts: Record<string, number> = {
      "glm-5.2": 0.000218,
      "claude-sonnet-5": 0.0017,
      "gpt-5.4": 0.001,
      "deepseek-v4-flash": 0.000027,
    };
    const baseCost = baseCosts[model] ?? 0.000218;
    const cost = (baseCost * (promptTokens + completionTokens) * 0.001).toFixed(8);
    const upstreamCost = (Number(cost) * 0.3).toFixed(8);

    await db.insert(usageRecords).values({
      id: crypto.randomUUID(),
      userId: testUserId,
      apiKeyId: finalApiKeyId,
      model,
      promptTokens,
      completionTokens,
      cost,
      upstreamCost,
      status: "completed",
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ),
    });
  }

  console.log("\n✅ Seed complete!");
  console.log("\nTest credentials:");
  console.log(`  Email:    test@ruvicode.com`);
  console.log(`  API key:  ${testKey}`);
  console.log(`  Balance:  $25.50`);
  console.log("");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
