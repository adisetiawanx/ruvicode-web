import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="mx-auto h-8 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
        <Skeleton className="mx-auto h-10 w-32" />
      </div>
    </div>
  );
}
