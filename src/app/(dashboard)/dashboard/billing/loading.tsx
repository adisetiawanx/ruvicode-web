import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/billing exactly:
 * h1 → 3 stat cards → table with 5 columns (Date, Method, Amount, Fee, Status)
 */
export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-default bg-surface p-6"
          >
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b border-border-subtle bg-surface-2/50 px-4 py-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="ml-auto h-3 w-14" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border-subtle p-4 last:border-0"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="ml-auto h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
