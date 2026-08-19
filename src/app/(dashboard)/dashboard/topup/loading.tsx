import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/topup exactly:
 * h1 → grid 2-col (Paddle left, USDC right)
 */
export default function TopUpLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[460px] rounded-lg" />
        <Skeleton className="h-[460px] rounded-lg" />
      </div>
    </div>
  );
}
