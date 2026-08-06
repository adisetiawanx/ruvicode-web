"use client";

import { useMemo } from "react";
import { ModelCard } from "@/components/marketing/model-card";
import { ModelFilters } from "@/components/marketing/model-filters";
import { useQueryStates, parseAsString, parseAsFloat, parseAsStringEnum } from "nuqs";
import type { ModelWithPricing } from "@/lib/db/queries/models";

const SORT_OPTIONS = ["cheapest", "name", "savings"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

export function ModelCatalogGrid({
  models,
  providers,
}: {
  models: ModelWithPricing[];
  providers: string[];
}) {
  // Read the same URL params as ModelFilters for client-side filtering + sorting.
  const [state] = useQueryStates({
    provider: parseAsString.withDefault(""),
    max_price: parseAsFloat.withDefault(20),
    sort: parseAsStringEnum<SortOption>([...SORT_OPTIONS]).withDefault("cheapest"),
  });

  const selectedProviders = useMemo(
    () => (state.provider ? state.provider.split(",").filter(Boolean) : []),
    [state.provider],
  );

  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      if (selectedProviders.length > 0 && !selectedProviders.includes(m.provider))
        return false;
      if (m.user_input > state.max_price) return false;
      return true;
    });

    result = result.sort((a, b) => {
      switch (state.sort) {
        case "name":
          return a.display_name.localeCompare(b.display_name);
        case "savings":
          return b.user_discount_pct - a.user_discount_pct;
        case "cheapest":
        default:
          return a.user_input - b.user_input;
      }
    });

    return result;
  }, [models, selectedProviders, state.max_price, state.sort]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <ModelFilters providers={providers} />
      <div className="flex-1">
        <p className="mb-4 text-sm text-text-muted">
          {filtered.length} model{filtered.length !== 1 ? "s" : ""} available
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border-default bg-surface p-12 text-center text-text-muted">
            No models match your filters. Try adjusting the price range or
            clearing filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <ModelCard key={m.model} model={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
