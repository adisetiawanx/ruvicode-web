import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/models exactly:
 * h1 + realtime badge + description + button → PricingTable (search + sortable table)
 */
export default function DashboardModelsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-40 rounded-md" />
      </div>

      {/* PricingTable */}
      <div className="rounded-lg border border-border-default bg-surface p-4">
        {/* Search/filter bar */}
        <Skeleton className="mb-4 h-10 w-full rounded-md" />
        {/* Table rows */}
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex gap-4 border-b border-border-subtle pb-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
