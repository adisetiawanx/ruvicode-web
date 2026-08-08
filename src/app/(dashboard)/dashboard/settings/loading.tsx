import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-4 rounded-lg border border-border-default bg-surface p-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="space-y-4 rounded-lg border border-border-default bg-surface p-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}
