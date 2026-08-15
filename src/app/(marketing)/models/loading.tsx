import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the actual /models structure so the swap-in feels seamless:
 * pricing hero -> how-it-works cards -> catalog grid.
 */
export default function ModelsLoading() {
  return (
    <>
      {/* Pricing hero */}
      <Container size="wide" className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto mb-4 h-7 w-40 rounded-full" />
          <Skeleton className="mx-auto mb-3 h-10 w-96" />
          <Skeleton className="mx-auto h-5 w-[28rem]" />
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </Container>

      {/* Catalog */}
      <Container size="wide" className="py-12">
        <Skeleton className="mb-2 h-9 w-56" />
        <Skeleton className="mb-8 h-5 w-[26rem]" />
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar skeleton */}
          <div className="space-y-6 lg:w-64 lg:flex-shrink-0">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-16" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-28" />
              ))}
            </div>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          {/* Grid skeleton */}
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
