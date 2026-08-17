import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin console skeleton — matches the overview layout:
 * 4 stat cards → 2 charts → system health grid → alerts.
 * Uses the same shimmer styling as the customer dashboard.
 */
export default function SuperLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <p className="h-4 w-56" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border-default bg-surface p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1 h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>

      {/* System health grid */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border-subtle bg-surface-2 p-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Alerts */}
      <Skeleton className="h-24 rounded-lg" />
    </div>
  );
}
