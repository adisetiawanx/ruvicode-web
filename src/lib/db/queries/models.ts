/**
 * Model pricing queries.
 *
 * Reads from the `model_prices` table via Drizzle ORM when Postgres is available.
 * Falls back to static seed data for local dev without Docker.
 *
 * Note: The DB schema does NOT have `context` or `capabilities` columns.
 * When reading from DB, these are returned as empty defaults ("", []).
 * The seed data fallback includes full values for richer dev rendering.
 *
 * SECURITY: All queries are parameterized automatically by the ORM.
 */

import { and, asc, eq } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { modelPrices } from "@/lib/db/schema";
import { MODEL_PRICES } from "@/lib/db/seed-data";
import {
  CURATED_SLUGS,
  formatContext,
  getCuratedModel,
  type ModelType,
} from "@/lib/models/catalog";

// ── Types ──

/**
 * The public shape consumed by frontend components.
 *
 * Fields marked "from DB" are available in both paths.
 * Fields marked "from seed" are only populated when the fallback is used.
 */
export interface ModelWithPricing {
  model: string;
  display_name: string;
  /** Brand from the curated catalog (upstream provider is masked). */
  provider: string;
  ref_input: number;
  ref_output: number;
  user_input: number;
  user_output: number;
  discount_pct: number;
  user_discount_pct: number;
  context: string;       // formatted context window from the curated catalog
  max_output: string;    // formatted max output tokens from the curated catalog
  /** Capability tags from the curated catalog. */
  capabilities: string[];
  is_active: boolean;
}

// ── Mapper ──

/** Map a Drizzle `model_prices` row to the frontend `ModelWithPricing` shape. */
function rowToModelPricing(
  row: typeof modelPrices.$inferSelect,
): ModelWithPricing {
  const curated = getCuratedModel(row.model);
  return {
    model: row.model,
    display_name: curated?.name ?? (row.displayName || row.model),
    provider: curated?.brand ?? row.provider,
    ref_input: Number(row.refInput),
    ref_output: Number(row.refOutput),
    user_input: Number(row.userInput),
    user_output: Number(row.userOutput),
    discount_pct: Number(row.discountPct),
    user_discount_pct: Number(row.userDiscountPct),
    context: curated ? formatContext(curated.context) : "",
    max_output: curated ? formatContext(curated.maxOutput) : "",
    capabilities: curated?.types ?? [],
    is_active: row.isActive,
  };
}

/** Filter to the curated slug list (only these appear in the public UI). */
function isCurated(slug: string): boolean {
  return CURATED_SLUGS.includes(slug);
}

// ── Query functions ──

/**
 * Get all active models with pricing data.
 * Sorted by user_input price ascending (cheapest first).
 */
export async function getAllActiveModels(): Promise<ModelWithPricing[]> {
  if (!isDbAvailable()) {
    return MODEL_PRICES.filter((m) => m.is_active && isCurated(m.model)).sort(
      (a, b) => a.user_input - b.user_input,
    );
  }

  const rows = await db
    .select()
    .from(modelPrices)
    .where(eq(modelPrices.isActive, true))
    .orderBy(asc(modelPrices.userInput));

  return rows.filter((r) => isCurated(r.model)).map(rowToModelPricing);
}

/**
 * Get top N models (by popularity — for now, the cheapest ones).
 */
export async function getTopModels(
  limit = 8,
): Promise<ModelWithPricing[]> {
  if (!isDbAvailable()) {
    return MODEL_PRICES.filter((m) => m.is_active)
      .sort((a, b) => a.user_input - b.user_input)
      .slice(0, limit);
  }

  const rows = await db
    .select()
    .from(modelPrices)
    .where(eq(modelPrices.isActive, true))
    .orderBy(asc(modelPrices.userInput))
    .limit(limit * 6); // over-fetch, then trim after curation

  return rows.filter((r) => isCurated(r.model)).map(rowToModelPricing).slice(0, limit);
}

/**
 * Get a single model by its slug (model name).
 * SECURITY: No path traversal risk — this is a pure data lookup.
 * The slug is validated against the regex `/^[a-z0-9.-]+$/` in the page layer
 * before this function is called.
 */
export async function getModelBySlug(
  slug: string,
): Promise<ModelWithPricing | null> {
  if (!isDbAvailable()) {
    return MODEL_PRICES.find((m) => m.model === slug && m.is_active) ?? null;
  }

  const [row] = await db
    .select()
    .from(modelPrices)
    .where(and(eq(modelPrices.model, slug), eq(modelPrices.isActive, true)))
    .limit(1);

  return row ? rowToModelPricing(row) : null;
}

/**
 * Get all unique providers from active models.
 */
/**
 * Brands shown in the filter sidebar. The database column is always the
 * masked "provider" string, so brands come from the curated catalog.
 */
export async function getAllProviders(): Promise<string[]> {
  if (!isDbAvailable()) {
    const brands = new Set(
      MODEL_PRICES.filter((m) => isCurated(m.model)).map(
        (m) => getCuratedModel(m.model)?.brand ?? m.provider,
      ),
    );
    return Array.from(brands).sort();
  }
  const { getBrands } = await import("@/lib/models/catalog");
  return getBrands();
}