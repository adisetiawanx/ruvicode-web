/**
 * Shared type exports inferred from Drizzle schema.
 *
 * Used across frontend components and can be exported for Go codegen
 * or API contract generation later. These types are the canonical shape
 * of each database row.
 */

import type {
  apiKeys,
  wallets,
  usageRecords,
  topups,
  modelPrices,
  depositAddresses,
  providerKeys,
  user,
  session,
  account,
  verification,
} from "./schema";

// Select types (shape of a row read from DB)
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type Topup = typeof topups.$inferSelect;
export type ModelPrice = typeof modelPrices.$inferSelect;
export type DepositAddress = typeof depositAddresses.$inferSelect;
export type ProviderKey = typeof providerKeys.$inferSelect;

// Insert types (shape for writing a new row)
export type NewUser = typeof user.$inferInsert;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type NewWallet = typeof wallets.$inferInsert;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
export type NewTopup = typeof topups.$inferInsert;
export type NewModelPrice = typeof modelPrices.$inferInsert;
export type NewDepositAddress = typeof depositAddresses.$inferInsert;
