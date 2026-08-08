import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder with shimmer animation (PAGES.md §9).
 *
 * Uses `skeleton-shimmer` class (defined in globals.css) for a left-to-right
 * gradient sweep. Background is surface-2 (dark warm tone, not gray).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-shimmer relative overflow-hidden rounded-md bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
