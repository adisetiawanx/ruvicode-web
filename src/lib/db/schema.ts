/**
 * Drizzle ORM schema — canonical database schema for Ruvicode.
 *
 * This file is the single source of truth for both the Next.js dashboard
 * (Drizzle ORM) and the Go gateway (structs matching these table/column names).
 * The Go backend uses golang-migrate with SQL files generated from this schema.
 *
 * Better-auth manages 4 core tables: user, session, account, verification.
 * We define them here so Drizzle relations work and migrations are unified.
 * Reference: https://www.better-auth.com/docs/concepts/database
 *
 * Business tables (9): api_keys, wallets, usage_records, topups, model_prices,
 * deposit_addresses, usage_hourly, provider_keys.
 *
 * Security: keyHash is unique (prevents duplicate keys), paddleTransactionId
 * and usdcTxHash are unique (idempotency for webhooks/deposits).
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ════════════════════════════════════════════════════════
// ENUMS
// ════════════════════════════════════════════════════════

export const topupMethodEnum = pgEnum("topup_method", ["paddle", "usdc"]);
export const topupStatusEnum = pgEnum("topup_status", [
  "pending",
  "completed",
  "failed",
]);
export const usageStatusEnum = pgEnum("usage_status", [
  "completed",
  "failed",
  "partial",
]);

// ════════════════════════════════════════════════════════
// USERS — Better-auth core table
// Better-auth creates this on first run; we define it here for
// Drizzle relations and unified migrations.
// Reference: https://www.better-auth.com/docs/concepts/database#user
// ════════════════════════════════════════════════════════

export const user = pgTable("user", {
  id: text("id").primaryKey(), // Better-auth uses text IDs
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  apiKeys: many(apiKeys),
  wallet: many(wallets),
  usageRecords: many(usageRecords),
  topups: many(topups),
  depositAddresses: many(depositAddresses),
}));

// ════════════════════════════════════════════════════════
// SESSION — Better-auth core table
// ════════════════════════════════════════════════════════

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// ════════════════════════════════════════════════════════
// ACCOUNT — Better-auth core table (OAuth + credential accounts)
// ════════════════════════════════════════════════════════

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // Hashed — for email/password accounts
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// ════════════════════════════════════════════════════════
// VERIFICATION — Better-auth core table (email verification, reset tokens)
// ════════════════════════════════════════════════════════

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════
// API KEYS
// Written by: Next.js dashboard (create/revoke)
// Read by: Go gateway (validate at runtime via Redis cache)
// ════════════════════════════════════════════════════════

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(), // UUID string — better-auth style
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Default"),
    keyPrefix: text("key_prefix").notNull(), // first 8 chars after rvcd_ for identification
    keyHash: text("key_hash").notNull().unique(), // SHA-256 of full key
    rateLimitRpm: integer("rate_limit_rpm").notNull().default(700),
    spendLimitDaily: decimal("spend_limit_daily", { precision: 10, scale: 4 }),
    spendLimitMonthly: decimal("spend_limit_monthly", {
      precision: 10,
      scale: 4,
    }),
    isActive: boolean("is_active").notNull().default(true),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => ({
    // Only index active keys for fast gateway lookup
    hashIdx: uniqueIndex("idx_api_keys_hash").on(table.keyHash),
    userIdx: index("idx_api_keys_user").on(table.userId),
  }),
);

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(user, { fields: [apiKeys.userId], references: [user.id] }),
  usageRecords: many(usageRecords),
}));

// ════════════════════════════════════════════════════════
// WALLETS
// One wallet per user. Source of truth for balance.
// Written by: Go gateway (deduct on API call), Next.js (credit on top-up)
// ════════════════════════════════════════════════════════

export const wallets = pgTable("wallets", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 12, scale: 6 })
    .notNull()
    .default("0"),
  held: decimal("held", { precision: 12, scale: 6 }).notNull().default("0"),
  totalLoaded: decimal("total_loaded", { precision: 12, scale: 6 })
    .notNull()
    .default("0"),
  totalSpent: decimal("total_spent", { precision: 12, scale: 6 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(user, { fields: [wallets.userId], references: [user.id] }),
}));

// ════════════════════════════════════════════════════════
// USAGE RECORDS
// Written by: Go gateway ONLY (after each API request completes)
// Read by: Next.js dashboard (usage history, charts)
// ════════════════════════════════════════════════════════

export const usageRecords = pgTable(
  "usage_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    apiKeyId: text("api_key_id")
      .notNull()
      .references(() => apiKeys.id),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens").notNull(),
    completionTokens: integer("completion_tokens").notNull(),
    reasoningTokens: integer("reasoning_tokens").default(0),
    // Tokens served from the prompt cache (ADR-032). Null on historical rows
    // (unknown), 0 written by the gateway when measured no cache.
    cacheReadTokens: integer("cache_read_tokens"),
    cost: decimal("cost", { precision: 12, scale: 8 }).notNull(), // amount charged to user
    upstreamCost: decimal("upstream_cost", { precision: 12, scale: 8 })
      .notNull()
      .default("0"), // wholesale infra cost as reported (not the wallet charge)
    marketCost: decimal("market_cost", { precision: 12, scale: 8 })
      .notNull()
      .default("0"), // estimated real wallet charge at marketplace best prices
    refCost: decimal("ref_cost", { precision: 12, scale: 8 })
      .notNull()
      .default("0"), // what the request would cost at the reference price
    // margin = cost - upstream_cost (computed on read; Drizzle doesn't
    // support GENERATED columns directly, so we calculate in queries)
    // savings = ref_cost - cost (what the user avoided paying vs reference)
    requestId: text("request_id"), // Ruvicode internal trace ID
    status: usageStatusEnum("status").notNull().default("completed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index("idx_usage_user_created").on(
      table.userId,
      table.createdAt,
    ),
    apiKeyIdx: index("idx_usage_api_key").on(table.apiKeyId, table.createdAt),
    modelIdx: index("idx_usage_model").on(table.model, table.createdAt),
  }),
);

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  user: one(user, { fields: [usageRecords.userId], references: [user.id] }),
  apiKey: one(apiKeys, {
    fields: [usageRecords.apiKeyId],
    references: [apiKeys.id],
  }),
}));

// ════════════════════════════════════════════════════════
// TOPUPS (Billing)
// Written by: Next.js webhook handler (on Paddle payment success)
// Read by: Next.js dashboard (billing history)
// ════════════════════════════════════════════════════════

export const topups = pgTable(
  "topups",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: topupMethodEnum("method").notNull(),
    paddleTransactionId: text("paddle_transaction_id"), // for idempotency
    usdcTxHash: text("usdc_tx_hash"), // for idempotency
    status: topupStatusEnum("status").notNull().default("pending"),
    fee: decimal("fee", { precision: 10, scale: 4 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userCreatedIdx: index("idx_topups_user_created").on(
      table.userId,
      table.createdAt,
    ),
    paddleIdx: uniqueIndex("idx_topups_paddle").on(table.paddleTransactionId),
    usdcIdx: uniqueIndex("idx_topups_usdc").on(table.usdcTxHash),
  }),
);

export const topupsRelations = relations(topups, ({ one }) => ({
  user: one(user, { fields: [topups.userId], references: [user.id] }),
}));

// ════════════════════════════════════════════════════════
// MODEL PRICES
// Written by: Go gateway cron (every 2 min from provider market API)
// Read by: Next.js dashboard (pricing page, model catalog)
// ════════════════════════════════════════════════════════

export const modelPrices = pgTable(
  "model_prices",
  {
    model: text("model").primaryKey(), // e.g., "glm-5.2"
    displayName: text("display_name"), // e.g., "GLM-5.2"
    provider: text("provider").notNull().default("provider"),
    refInput: decimal("ref_input", { precision: 10, scale: 6 }).notNull(),
    refOutput: decimal("ref_output", { precision: 10, scale: 6 }).notNull(),
    providerInput: decimal("provider_input", {
      precision: 10,
      scale: 6,
    }).notNull(),
    providerOutput: decimal("provider_output", {
      precision: 10,
      scale: 6,
    }).notNull(),
    userInput: decimal("user_input", { precision: 10, scale: 6 }).notNull(),
    userOutput: decimal("user_output", { precision: 10, scale: 6 }).notNull(),
    // Cached input token prices (ADR-032), reconstructed at sync time.
    refCacheRead: decimal("ref_cache_read_per_1m", {
      precision: 10,
      scale: 6,
    }).notNull(),
    userCacheRead: decimal("user_cache_read_per_1m", {
      precision: 10,
      scale: 6,
    }).notNull(),
    discountPct: decimal("discount_pct", { precision: 5, scale: 2 }).notNull(),
    userDiscountPct: decimal("user_discount_pct", {
      precision: 5,
      scale: 2,
    }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    providerIdx: index("idx_model_prices_provider").on(
      table.provider,
      table.isActive,
    ),
  }),
);

// ════════════════════════════════════════════════════════
// DEPOSIT ADDRESSES (USDC)
// Written by: Next.js (generate on first top-up page visit)
// Read by: Next.js + Go (monitor for incoming USDC)
// ════════════════════════════════════════════════════════

export const depositAddresses = pgTable(
  "deposit_addresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    chain: integer("chain").notNull().default(8453), // Base
    address: text("address").notNull(),
    derivationIndex: integer("derivation_index").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueAddress: uniqueIndex("idx_deposit_address").on(
      table.userId,
      table.address,
    ),
    addressLookup: index("idx_deposit_addr").on(table.address),
  }),
);

export const depositAddressesRelations = relations(
  depositAddresses,
  ({ one }) => ({
    user: one(user, {
      fields: [depositAddresses.userId],
      references: [user.id],
    }),
  }),
);

// ════════════════════════════════════════════════════════
// USAGE HOURLY (Aggregation)
// Written by: Go gateway cron (every 15 min)
// Read by: Next.js dashboard (charts — fast aggregated reads)
// ════════════════════════════════════════════════════════

export const usageHourly = pgTable(
  "usage_hourly",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    hourBucket: timestamp("hour_bucket").notNull(), // truncated to hour
    model: text("model").notNull(),
    requestCount: integer("request_count").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    totalCost: decimal("total_cost", { precision: 12, scale: 6 })
      .notNull()
      .default("0"),
  },
  (table) => ({
    pk: uniqueIndex("idx_usage_hourly_pk").on(
      table.userId,
      table.hourBucket,
      table.model,
    ),
  }),
);

// ════════════════════════════════════════════════════════
// PROVIDER KEYS (Operational)
// Written by: Manual (DB seed or admin)
// Read by: Go gateway (key pool rotation)
// Named "provider_keys" (per the provider-abstraction rule)
// ════════════════════════════════════════════════════════

export const providerKeys = pgTable("provider_keys", {
  id: text("id").primaryKey(),
  keyLabel: text("key_label").notNull(),
  keyPrefix: text("key_prefix").notNull(), // first 8 chars after inf_
  isActive: boolean("is_active").notNull().default(true),
  lastHealthCheck: timestamp("last_health_check"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: text("id").primaryKey(),
    adminEmail: text("admin_email").notNull(),
    action: text("action").notNull(),
    operationId: text("operation_id"),
    status: text("status").notNull(),
    details: text("details").notNull().default("{}"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index("idx_admin_audit_created").on(table.createdAt),
  }),
);
