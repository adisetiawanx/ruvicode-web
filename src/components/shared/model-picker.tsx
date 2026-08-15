"use client";

import { useMemo, useState } from "react";
import { Search, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ModelWithPricing } from "@/lib/db/queries/models";

function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(3);
  return price.toFixed(2);
}

interface ModelPickerProps {
  models: ModelWithPricing[];
  value: string;
  onChange: (model: string) => void;
}

/**
 * Searchable model picker dialog. Replaces the cramped native select,
 * whose dropdown was clipped and unusable with 160 models.
 */
export function ModelPicker({ models, value, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = models.find((m) => m.model === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.display_name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q),
    );
  }, [models, query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-left transition-colors hover:border-border-default"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm text-text-primary">
                {selected?.display_name ?? value}
              </span>
              <span className="block truncate font-mono text-xs text-text-muted">
                ${formatPrice(selected?.user_input ?? 0)}/1M in · save{" "}
                {(selected?.user_discount_pct ?? 0).toFixed(0)}%
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a model</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${models.length} models...`}
            className="pl-9"
          />
        </div>
        <div className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-text-muted">
              No models match &quot;{query}&quot;.
            </p>
          )}
          {filtered.map((m) => {
            const isActive = m.model === value;
            return (
              <button
                key={m.model}
                type="button"
                onClick={() => {
                  onChange(m.model);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-accent-subtle"
                    : "hover:bg-surface-2"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-text-primary">
                    {m.display_name}
                  </span>
                  <span className="block truncate font-mono text-xs tabular text-text-muted">
                    ${formatPrice(m.user_input)}/1M in · $
                    {formatPrice(m.user_output)}/1M out
                  </span>
                </span>
                {isActive && (
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
