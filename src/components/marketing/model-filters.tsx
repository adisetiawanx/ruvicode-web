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

const SORT_OPTIONS = ["cheapest", "name", "savings"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

export function ModelFilters({
  providers,
}: {
  providers: string[];
}) {
  // nuqs: type-safe URL params — prevents injection via query strings.
  // Provider list is a comma-separated string, parsed safely.
  const [filters, setFilters] = useQueryStates({
    provider: parseAsString.withDefault(""),
    max_price: parseAsFloat.withDefault(20),
    sort: parseAsStringEnum<SortOption>([...SORT_OPTIONS]).withDefault(
      "cheapest",
    ),
  });

  const selectedProviders = useMemo(
    () => (filters.provider ? filters.provider.split(",").filter(Boolean) : []),
    [filters.provider],
  );

  function toggleProvider(p: string) {
    const current = selectedProviders;
    const next = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p];
    setFilters({ provider: next.join(",") });
  }

  return (
    <aside className="w-full space-y-6 lg:w-64 lg:flex-shrink-0">
      <div>
        <h4 className="mb-3 text-sm font-semibold">Sort by</h4>
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              className={`text-left text-sm transition-colors ${
                filters.sort === s
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => setFilters({ sort: s })}
            >
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">Provider</h4>
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
                className="cursor-pointer text-sm text-text-secondary"
              >
                {p}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">
          Max Price (per 1M tokens)
        </h4>
        <Slider
          value={filters.max_price}
          onValueChange={(v) => setFilters({ max_price: v as number })}
          max={20}
          step={0.5}
        />
        <p className="mt-2 font-mono text-xs text-text-muted">
          ${filters.max_price.toFixed(2)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ provider: "", max_price: 20 })}
      >
        Clear Filters
      </Button>
    </aside>
  );
}
