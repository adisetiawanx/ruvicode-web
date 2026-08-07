import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}

/**
 * Reusable dashboard stat card.
 * Values are pre-formatted strings (caller controls formatting).
 * Financial numbers should already be in mono tabular style by convention.
 */
export function StatCard({
  label,
  value,
  sublabel,
  accent,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6",
        accent
          ? "border-accent/30 bg-accent-subtle"
          : "border-border-default bg-surface",
      )}
    >
      <p className="mb-1 text-xs text-text-secondary">{label}</p>
      <p className="font-mono text-2xl tabular text-text-primary">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
    </div>
  );
}
