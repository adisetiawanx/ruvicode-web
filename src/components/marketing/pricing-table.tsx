"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsStringEnum } from "nuqs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ModelWithPricing } from "@/lib/db/queries/models";

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
  const [state, setState] = useQueryStates({
    sort: parseAsStringEnum<SortKey>(SORT_KEYS).withDefault("savings"),
    dir: parseAsStringEnum<SortDir>(["asc", "desc"]).withDefault("desc"),
    filter: parseAsStringEnum<Filter>(FILTERS).withDefault("all"),
  });

  const sorted = useMemo(() => {
    const filtered = models.filter((m) => {
      if (state.filter === "all") return true;
      return m.capabilities.includes(state.filter);
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
  }, [models, state]);

  function toggleSort(key: SortKey) {
    if (state.sort === key) {
      setState({ sort: key, dir: state.dir === "desc" ? "asc" : "desc" });
    } else {
      setState({ sort: key, dir: "desc" });
    }
  }

  return (
    <div>
      {/* Filter pills */}
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
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr
                  key={m.model}
                  className="border-b border-border-subtle transition-colors last:border-0 hover:bg-surface/50"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{m.display_name}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-text-secondary">
                    ${formatPrice(m.user_input)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-text-secondary">
                    ${formatPrice(m.user_output)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tabular font-medium text-success">
                      −{m.user_discount_pct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-xs text-text-muted">
        Prices update every 2 minutes. Last updated:{" "}
        <span className="font-mono">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
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
