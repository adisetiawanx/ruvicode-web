import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /calculator exactly:
 * label (Cost Calculator) → h1 → description → CostCalculator (grid 2-col)
 */
export default function CalculatorLoading() {
  return (
    <Container size="wide" className="py-12">
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="mb-3 h-10 w-72" />
      <Skeleton className="mb-8 h-5 w-96" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: inputs */}
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        {/* Right: results */}
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </Container>
  );
}
