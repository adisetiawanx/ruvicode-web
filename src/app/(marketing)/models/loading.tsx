import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModelsLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="mb-2 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-96" />
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar skeleton */}
        <div className="space-y-6 lg:w-64 lg:flex-shrink-0">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-32" />
            ))}
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="mb-4">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
