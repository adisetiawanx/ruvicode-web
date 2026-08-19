import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /blog/[slug] exactly:
 * breadcrumb → article header (badge + date + readingTime) → h1 → description
 * → tags → MDX content → CTA → author bio
 */
export default function BlogPostLoading() {
  return (
    <Container size="prose" className="py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Article header */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-20" />
      </div>

      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-8 h-6 w-3/4" />

      {/* Tags */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

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

      {/* CTA */}
      <div className="mt-12 rounded-lg border-2 border-accent bg-accent-subtle p-8 text-center">
        <Skeleton className="mx-auto mb-2 h-6 w-56" />
        <Skeleton className="mx-auto mb-4 h-4 w-48" />
        <Skeleton className="mx-auto h-10 w-40 rounded-md" />
      </div>

      {/* Author bio */}
      <div className="mt-8 flex items-center gap-4 border-t border-border-subtle pt-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Container>
  );
}
