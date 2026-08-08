import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder with shimmer animation (PAGES.md §9).
 *
 * The `skeleton-shimmer` class (defined in globals.css) uses a
 * background-position sweep — no pseudo-element, no overflow clipping.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
