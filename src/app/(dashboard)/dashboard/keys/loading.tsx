import { Skeleton } from "@/components/ui/skeleton";

export default function KeysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border-subtle p-4 last:border-0"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="ml-auto h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
