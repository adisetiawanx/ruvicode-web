import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <Container size="wide" className="py-20">
      <Skeleton className="mx-auto mb-3 h-10 w-96" />
      <Skeleton className="mx-auto mb-12 h-6 w-64" />
      <div className="space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-border-default">
          <Skeleton className="h-12 w-full rounded-none" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      </div>
    </Container>
  );
}
