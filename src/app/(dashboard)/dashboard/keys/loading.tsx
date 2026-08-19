import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/keys exactly:
 * h1 + button row → table with 6 columns (Label, Key, Rate Limit, Spend Limit, Last Used, Actions)
 */
export default function KeysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b border-border-subtle bg-surface-2/50 px-4 py-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-14" />
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border-subtle p-4 last:border-0"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
