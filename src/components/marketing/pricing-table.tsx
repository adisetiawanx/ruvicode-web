"use client";

import { useMemo, useState } from "react";
import { useQueryStates, parseAsStringEnum, parseAsInteger } from "nuqs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ModelTag } from "@/components/shared/model-tag";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ModelWithPricing } from "@/lib/db/queries/models";
import { ClientTime } from "@/components/shared/client-time";

type SortKey = "model" | "user_input" | "user_output" | "savings";
type SortDir = "asc" | "desc";
type Filter = "all" | "text" | "vision" | "reasoning" | "tools";

const SORT_KEYS: SortKey[] = ["model", "user_input", "user_output", "savings"];
const FILTERS: Filter[] = ["all", "text", "vision", "reasoning", "tools"];

/** Format price — shows more decimals for very cheap models. */
function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

export function PricingTable({ models }: { models: ModelWithPricing[] }) {
  // nuqs: type-safe URL search params — prevents injection via query strings.
  // Values are validated against enum unions; invalid values fall back to defaults.
  const [query, setQuery] = useState("");
  const [state, setState] = useQueryStates({
    sort: parseAsStringEnum<SortKey>(SORT_KEYS).withDefault("savings"),
    dir: parseAsStringEnum<SortDir>(["asc", "desc"]).withDefault("desc"),
    filter: parseAsStringEnum<Filter>(FILTERS).withDefault("all"),
    tpage: parseAsInteger.withDefault(1),
  });

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = models.filter((m) => {
      if (state.filter === "all") return true;
      return m.capabilities.includes(state.filter);
    }).filter((m) => {
      if (!q) return true;
      return (
        m.display_name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      );
    });

    return filtered.sort((a, b) => {
      let cmp = 0;
      switch (state.sort) {
        case "model":
          cmp = a.display_name.localeCompare(b.display_name);
          break;
        case "user_input":
          cmp = a.user_input - b.user_input;
          break;
        case "user_output":
          cmp = a.user_output - b.user_output;
          break;
        case "savings":
          cmp = a.user_discount_pct - b.user_discount_pct;
          break;
      }
      return state.dir === "asc" ? cmp : -cmp;
    });
  }, [models, query, state]);

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, state.tpage), totalPages);
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (state.sort === key) {
      setState({ sort: key, dir: state.dir === "desc" ? "asc" : "desc", tpage: null });
    } else {
      setState({ sort: key, dir: "desc", tpage: null });
    }
  }

  return (
    <div>
      {/* Search + filter pills */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models..."
          className="h-9 w-full rounded-md border border-border-subtle bg-surface-2 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          aria-label="Search models"
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={state.filter === f ? "primary" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setState({ filter: f })}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border-default">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-default bg-surface">
              <tr>
                <SortHeader
                  label="Model"
                  sortKey="model"
                  current={state}
                  onToggle={toggleSort}
                />
                <SortHeader
                  label="Input $/1M"
                  sortKey="user_input"
                  current={state}
                  onToggle={toggleSort}
                  align="right"
                />
                <SortHeader
                  label="Output $/1M"
                  sortKey="user_output"
                  current={state}
                  onToggle={toggleSort}
                  align="right"
                />
                <SortHeader
                  label="vs OpenRouter"
                  sortKey="savings"
                  current={state}
                  onToggle={toggleSort}
                  align="right"
                />
                <th className="px-4 py-3 text-right font-semibold">Context</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((m) => (
                <tr
                  key={m.model}
                  className="border-b border-border-subtle transition-colors last:border-0 hover:bg-surface/50"
                >
                  <td className="px-4 py-3">
                    <span className="flex items-start gap-2.5">
                      <BrandLogo brand={m.provider} className="mt-0.5 h-5 w-5 shrink-0" />
                      <ModelTag id={m.model} stacked={false} className="min-w-0" />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tabular text-text-secondary">
                      ${formatPrice(m.user_input)}
                    </span>
                    {m.ref_input > m.user_input && (
                      <span className="ml-1 font-mono tabular text-[11px] text-text-muted line-through">
                        ${formatPrice(m.ref_input)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tabular text-text-secondary">
                      ${formatPrice(m.user_output)}
                    </span>
                    {m.ref_output > m.user_output && (
                      <span className="ml-1 font-mono tabular text-[11px] text-text-muted line-through">
                        ${formatPrice(m.ref_output)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tabular font-medium text-success">
                      −{m.user_discount_pct.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-text-muted">
                    {m.context || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setState({ tpage: page - 1 })}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
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
            onClick={() => setState({ tpage: page + 1 })}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <p className="mt-4 text-xs text-text-muted">
        Live market pricing. Last updated:{" "}
        <ClientTime utc={new Date().toISOString()} format="time" className="font-mono" />
      </p>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  onToggle,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: { sort: SortKey; dir: SortDir };
  onToggle: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = current.sort === sortKey;
  return (
    <th className={`px-4 py-3 text-${align}`}>
      <button
        className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-text-primary"
        onClick={() => onToggle(sortKey)}
      >
        {label}
        {isActive &&
          (current.dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </button>
    </th>
  );
}
