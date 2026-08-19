import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /playground exactly:
 * header (h1 + description) → grid [1fr_280px] (chat left, settings right)
 * The real page uses PlaygroundChat which is a grid [1fr_280px].
 */
export default function PlaygroundLoading() {
  return (
    <Container size="wide" className="py-12">
      {/* Header */}
      <Skeleton className="mb-2 h-10 w-48" />
      <Skeleton className="mb-8 h-5 w-96" />

      {/* Chat + settings grid — chat left, settings right */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Chat area */}
        <Skeleton className="h-[600px] max-h-[75vh] w-full rounded-lg" />

        {/* Settings panel */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </Container>
  );
}
