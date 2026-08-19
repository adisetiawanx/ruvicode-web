import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /models/[model] exactly:
 * breadcrumb → header (logo + h1 + badge + ModelTag + capabilities + button)
 * → price strip (4-col grid) → grid [1fr_320px] (quickstart left, reference right)
 */
export default function ModelDetailLoading() {
  return (
    <Container size="wide" className="py-10 md:py-14">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="mb-1 h-7 w-40 rounded-md" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>

        {/* Price strip — 4 columns */}
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-default bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface p-5">
              <Skeleton className="mb-1.5 h-3.5 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid: quickstart left, reference right */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Quickstart */}
        <div>
          <Skeleton className="mb-1 h-6 w-28" />
          <Skeleton className="mb-4 h-4 w-72" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="mt-8 flex items-center justify-between rounded-xl border border-border-default bg-surface p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Right: reference cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border-default bg-surface p-6">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-baseline justify-between border-t border-border-subtle pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
          </div>

          <div className="rounded-xl border border-border-default bg-surface p-6">
            <Skeleton className="mb-4 h-5 w-16" />
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="mx-auto h-4 w-28" />
        </div>
      </div>
    </Container>
  );
}
