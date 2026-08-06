import { Skeleton } from "@/components/ui/skeleton";

export default function DocLoading() {
  return (
    <article>
      <Skeleton className="mb-6 h-5 w-24" />
      <Skeleton className="mb-4 h-10 w-48" />
      <Skeleton className="mb-8 h-5 w-3/4" />
      <div className="space-y-4 border-t border-border-subtle pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-20 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </article>
  );
}
