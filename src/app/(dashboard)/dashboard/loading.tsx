import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard exactly:
 * h1 → 3 stat cards → 2 charts → recent activity table
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-default bg-surface p-6"
          >
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="mb-1 h-8 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[360px] rounded-lg" />
        <Skeleton className="h-[360px] rounded-lg" />
      </div>

      {/* Recent activity */}
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        <div className="border-b border-border-subtle px-4 py-3">
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border-subtle p-4 last:border-0"
          >
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="ml-auto h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
