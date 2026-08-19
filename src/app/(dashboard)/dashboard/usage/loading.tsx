import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/usage exactly:
 * h1 → filters row + export → 3 stat cards → table with 6 columns → pagination
 */
export default function UsageLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* Filters + export */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Summary stats */}
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
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          {/* Header row */}
          <div className="flex items-center gap-4 border-b border-border-subtle bg-surface-2/50 px-4 py-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="ml-auto h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          {/* Data rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border-subtle p-4 last:border-0"
            >
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="ml-auto h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
