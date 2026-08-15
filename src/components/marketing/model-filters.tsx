"use client";

import { useMemo } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsFloat,
  parseAsStringEnum,
} from "nuqs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { MODEL_TYPES } from "@/lib/models/catalog";

const SORT_OPTIONS = ["cheapest", "name", "savings"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const DEFAULT_MAX_PRICE = 20;

export function ModelFilters({
  providers,
  resultCount,
  onPageReset,
}: {
  providers: string[];
  resultCount?: number;
  /** Reset pagination whenever a filter changes. */
  onPageReset?: () => void;
}) {
  // nuqs: type-safe URL params — prevents injection via query strings.
  // Provider list is a comma-separated string, parsed safely.
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    provider: parseAsString.withDefault(""),
    max_price: parseAsFloat.withDefault(DEFAULT_MAX_PRICE),
    sort: parseAsStringEnum<SortOption>([...SORT_OPTIONS]).withDefault(
      "cheapest",
    ),
    type: parseAsStringEnum<(typeof MODEL_TYPES)[number]>([...MODEL_TYPES]),
  });

  const selectedProviders = useMemo(
    () => (filters.provider ? filters.provider.split(",").filter(Boolean) : []),
    [filters.provider],
  );

  function update(patch: Partial<typeof filters>) {
    onPageReset?.();
    setFilters(patch);
  }

  function toggleProvider(p: string) {
    const current = selectedProviders;
    const next = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p];
    update({ provider: next.join(",") });
  }

  return (
    <aside className="w-full space-y-6 lg:w-64 lg:flex-shrink-0">
      <div>
        <label htmlFor="model-search" className="sr-only">
          Search models
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            id="model-search"
            type="search"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search models..."
            className="h-10 w-full rounded-md border border-border-subtle bg-surface-2 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-[15px] font-semibold">Sort by</h4>
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              className={`text-left text-[15px] transition-colors ${
                filters.sort === s
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => update({ sort: s })}
            >
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-[15px] font-semibold">Type</h4>
        <div className="flex flex-wrap gap-1.5">
          {MODEL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => update({ type: filters.type === t ? null : t })}
              className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors ${
                filters.type === t
                  ? "border-accent/40 bg-accent-subtle text-accent-text"
                  : "border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-[15px] font-semibold">Provider</h4>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <Checkbox
                id={`provider-${p}`}
                checked={selectedProviders.includes(p)}
                onCheckedChange={() => toggleProvider(p)}
              />
              <label
                htmlFor={`provider-${p}`}
                className="cursor-pointer text-[15px] text-text-secondary"
              >
                {p}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-[15px] font-semibold">
          Max price (per 1M tokens)
        </h4>
        <Slider
          value={filters.max_price}
          onValueChange={(v) => update({ max_price: Number(v) })}
          max={DEFAULT_MAX_PRICE}
          step={0.5}
        />
        {/* Precise manual entry: most models cost fractions of a dollar,
            so the slider alone is too coarse. */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-sm text-text-muted">$</span>
          <input
            type="number"
            min={0}
            max={DEFAULT_MAX_PRICE}
            step={0.01}
            value={filters.max_price}
            onChange={(e) => {
              const v = e.target.value === "" ? 0 : Number(e.target.value);
              if (!Number.isNaN(v)) update({ max_price: v });
            }}
            className="h-8 w-24 rounded-md border border-border-subtle bg-surface-2 px-2 font-mono text-sm tabular text-text-primary outline-none focus:border-accent"
            aria-label="Max price per 1M tokens, exact value"
          />
          <span className="text-xs text-text-muted">/1M</span>
        </div>
        {typeof resultCount === "number" && (
          <p className="mt-2 text-xs text-text-muted">
            {resultCount} match{resultCount !== 1 ? "es" : ""}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => update({ q: "", provider: "", max_price: DEFAULT_MAX_PRICE })}
      >
        Clear Filters
      </Button>
    </aside>
  );
}
