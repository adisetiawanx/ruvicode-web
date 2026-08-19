import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the actual /status structure so the swap-in feels seamless:
 * header -> overall status card -> model availability grid.
 */
export default function StatusLoading() {
  return (
    <Container size="wide" className="py-16">
      {/* Header */}
      <div className="mb-10">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-4 h-10 w-72" />
        <Skeleton className="h-8 w-64 rounded-full" />
      </div>

      {/* Overall status card */}
      <div className="mb-12 rounded-xl border border-border-default bg-surface p-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-3 rounded-full" />
          <div>
            <Skeleton className="mb-1.5 h-6 w-28" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border-subtle bg-surface-2/50 p-4"
            >
              <Skeleton className="mb-2 h-3.5 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Model availability */}
      <Skeleton className="mb-4 h-6 w-44" />
      <div className="overflow-hidden rounded-xl border border-border-default">
        <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle md:border-b"
            >
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="hidden h-3 w-24 lg:block" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
