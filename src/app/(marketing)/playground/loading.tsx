import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the actual /playground structure: header, info bar, settings
 * panel on the left, chat box on the right.
 */
export default function PlaygroundLoading() {
  return (
    <Container size="wide" className="py-12">
      <Skeleton className="mb-2 h-10 w-56" />
      <Skeleton className="mb-8 h-5 w-80" />
      {/* Info bar */}
      <Skeleton className="mb-4 h-12 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Settings panel */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        {/* Chat area */}
        <Skeleton className="h-[600px] max-h-[75vh] w-full rounded-lg" />
      </div>
    </Container>
  );
}
