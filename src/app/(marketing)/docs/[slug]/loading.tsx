import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /docs/[slug] exactly:
 * breadcrumb nav → h1 → description → MDX content
 */
export default function DocLoading() {
  return (
    <article>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-20" />
      </div>

      <Skeleton className="mb-4 h-10 w-56" />
      <Skeleton className="mb-8 h-5 w-3/4" />

      {/* MDX content */}
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
