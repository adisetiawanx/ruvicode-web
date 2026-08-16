"use client";

import { displayModelName } from "@/lib/models/display";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface UsageFiltersClientProps {
  models: string[];
  keyLabels: string[];
  currentModel?: string;
  currentKeyLabel?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}

/**
 * Usage filter controls — updates URL params for SSR re-fetch.
 * Uses plain HTML controls for simplicity and accessibility.
 */
export function UsageFiltersClient({
  models,
  keyLabels,
  currentModel,
  currentKeyLabel,
  currentDateFrom,
  currentDateTo,
}: UsageFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      router.push(`/dashboard/usage?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <label
          htmlFor="filter-model"
          className="block text-xs font-medium text-text-secondary"
        >
          Model
        </label>
        <select
          id="filter-model"
          value={currentModel ?? "all"}
          onChange={(e) => updateParam("model", e.target.value)}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 pr-8 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {displayModelName(m)}
            </option>
          ))}
        </select>
      </div>

      {keyLabels.length > 0 && (
        <div className="space-y-1.5">
          <label
            htmlFor="filter-key"
            className="block text-xs font-medium text-text-secondary"
          >
            API Key
          </label>
          <select
            id="filter-key"
            value={currentKeyLabel ?? "all"}
            onChange={(e) => updateParam("keyLabel", e.target.value)}
            className="h-8 rounded-lg border border-input bg-input/30 px-2.5 pr-8 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All keys</option>
            {keyLabels.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="filter-from"
          className="block text-xs font-medium text-text-secondary"
        >
          From
        </label>
        <input
          id="filter-from"
          type="date"
          value={currentDateFrom ?? ""}
          onChange={(e) => updateParam("dateFrom", e.target.value)}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="filter-to"
          className="block text-xs font-medium text-text-secondary"
        >
          To
        </label>
        <input
          id="filter-to"
          type="date"
          value={currentDateTo ?? ""}
          onChange={(e) => updateParam("dateTo", e.target.value)}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
    </div>
  );
}
