import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard skeleton — matches the overview layout:
 * 3 stat cards → 2 charts → 1 recent activity table.
 * Uses shimmer animation (PAGES.md §9).
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer relative overflow-hidden rounded-lg border border-border-default bg-surface p-6"
          >
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="mb-1 h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[360px] rounded-lg" />
        <Skeleton className="h-[360px] rounded-lg" />
      </div>

      {/* Table skeleton */}
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  );
}
