/**
 * Model pricing queries.
 *
 * Currently backed by static seed data (`src/lib/db/schema.ts`) — will be
 * swapped to Drizzle ORM queries once Postgres is provisioned.
 *
 * SECURITY: When Drizzle is added, all filtering inputs are parameterized
 * automatically by the ORM. No raw SQL strings are ever used.
 */

import { MODEL_PRICES, type ModelPricing } from "@/lib/db/seed-data";

export type ModelWithPricing = ModelPricing;

/**
 * Get all active models with pricing data.
 * Sorted by user_input price ascending (cheapest first).
 */
export async function getAllActiveModels(): Promise<ModelWithPricing[]> {
  return MODEL_PRICES.filter((m) => m.is_active).sort(
    (a, b) => a.user_input - b.user_input,
  );
}

/**
 * Get top N models (by popularity — for now, the cheapest ones).
 */
export async function getTopModels(
  limit = 8,
): Promise<ModelWithPricing[]> {
  return MODEL_PRICES.filter((m) => m.is_active)
    .sort((a, b) => a.user_input - b.user_input)
    .slice(0, limit);
}

/**
 * Get a single model by its slug (model name).
 * SECURITY: No path traversal risk — this is a pure data lookup.
 * The slug is validated against the regex `/^[a-z0-9-]+$/` in the page layer
 * before this function is called.
 */
export async function getModelBySlug(
  slug: string,
): Promise<ModelWithPricing | null> {
  return MODEL_PRICES.find((m) => m.model === slug && m.is_active) ?? null;
}

/**
 * Get all unique providers from active models.
 */
export async function getAllProviders(): Promise<string[]> {
  const providers = new Set(MODEL_PRICES.map((m) => m.provider));
  return Array.from(providers).sort();
}
