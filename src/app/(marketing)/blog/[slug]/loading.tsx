import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <Container size="prose" className="py-12">
      <Skeleton className="mb-8 h-5 w-48" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-8 h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-8 space-y-4 border-t border-border-subtle pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-20 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Container>
  );
}
