import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModelDetailLoading() {
  return (
    <Container size="wide" className="py-12">
      <Skeleton className="mb-8 h-5 w-48" />
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Container>
  );
}
