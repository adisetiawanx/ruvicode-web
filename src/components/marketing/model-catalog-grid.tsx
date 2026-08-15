"use client";

import { useMemo } from "react";
import { ModelCard } from "@/components/marketing/model-card";
import { ModelFilters } from "@/components/marketing/model-filters";
import {
  useQueryStates,
  parseAsString,
  parseAsFloat,
  parseAsStringEnum,
  parseAsInteger,
} from "nuqs";
import { MODEL_TYPES, type ModelType } from "@/lib/models/catalog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ModelWithPricing } from "@/lib/db/queries/models";

const SORT_OPTIONS = ["cheapest", "name", "savings"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const PAGE_SIZE = 16;

export function ModelCatalogGrid({
  models,
  providers,
}: {
  models: ModelWithPricing[];
  providers: string[];
}) {
  // Shared URL params with ModelFilters. nuqs keeps them type-safe and in
  // sync with the address bar, so pagination is shareable and back-button
  // friendly.
  const [state, setState] = useQueryStates({
    provider: parseAsString.withDefault(""),
    max_price: parseAsFloat.withDefault(20),
    sort: parseAsStringEnum<SortOption>([...SORT_OPTIONS]).withDefault("cheapest"),
    type: parseAsStringEnum<ModelType>([...MODEL_TYPES]),
    page: parseAsInteger.withDefault(1),
  });

  const selectedProviders = useMemo(
    () => (state.provider ? state.provider.split(",").filter(Boolean) : []),
    [state.provider],
  );

  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      if (selectedProviders.length > 0 && !selectedProviders.includes(m.provider))
        return false;
      if (state.type && !m.capabilities.includes(state.type))
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp page when filters shrink the result set.
  const page = Math.min(Math.max(1, state.page), totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (next: number) => {
    setState({ page: next });
    document
      .getElementById("model-catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <ModelFilters
        providers={providers}
        resultCount={filtered.length}
        onPageReset={() => setState({ page: null })}
      />
      <div className="min-w-0 flex-1">
        <p className="mb-4 text-sm text-text-muted">
          {filtered.length} model{filtered.length !== 1 ? "s" : ""} available
          {totalPages > 1 && ` · page ${page} of ${totalPages}`}
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border-default bg-surface p-12 text-center text-text-muted">
            No models match your filters. Try adjusting the price range or
            clearing filters.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((m) => (
                <ModelCard key={m.model} model={m} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border-default transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm tabular text-text-secondary">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border-default transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
