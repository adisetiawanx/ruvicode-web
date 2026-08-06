import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlaygroundLoading() {
  return (
    <Container size="wide" className="py-12">
      <Skeleton className="mb-2 h-10 w-48" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    </Container>
  );
}
