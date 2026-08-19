import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors /dashboard/settings exactly:
 * h1 → Account section → Security section → Danger Zone section
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Account */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
      </section>

      {/* Security */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-lg border border-error/30 bg-error-subtle p-6">
        <Skeleton className="mb-2 h-6 w-28" />
        <Skeleton className="mb-4 h-4 w-72" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </section>
    </div>
  );
}
