"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

interface SelectOption { value: string; label: string }
interface FilterField {
  name: string;
  type: "select" | "search";
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: string;
}

interface AdminFilterBarProps {
  fields: FilterField[];
  /** Extra params to preserve when clearing (e.g. "page" is always cleared). */
  preserve?: string[];
  children?: ReactNode;
}

/**
 * Admin filter bar — selects auto-submit on change,
 * text search submits on Enter, and a Clear button resets all filters.
 * URL is the single source of truth (SSR re-fetch).
 */
export function AdminFilterBar({ fields, preserve = [], children }: AdminFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    preserve.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams, preserve]);

  const hasActiveFilter = fields.some(
    (f) => searchParams.get(f.name) && searchParams.get(f.name) !== "",
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <label htmlFor={`filter-${field.name}`} className="block text-xs font-medium text-text-secondary">
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              id={`filter-${field.name}`}
              value={searchParams.get(field.name) ?? field.defaultValue ?? ""}
              onChange={(e) => updateParam(field.name, e.target.value)}
              className="h-8 rounded-lg border border-input bg-input/30 px-2.5 pr-8 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All {field.label.toLowerCase()}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`filter-${field.name}`}
              type="search"
              defaultValue={searchParams.get(field.name) ?? ""}
              placeholder={field.placeholder ?? `Search ${field.label.toLowerCase()}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  updateParam(field.name, (e.target as HTMLInputElement).value);
                }
              }}
              className="h-8 w-48 rounded-lg border border-input bg-input/30 px-3 text-sm text-text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          )}
        </div>
      ))}
      {children}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={clearAll}
          className="h-8 rounded-lg border border-border-default px-3 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          Clear
        </button>
      )}
    </div>
  );
}
