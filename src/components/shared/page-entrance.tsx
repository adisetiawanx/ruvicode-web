import type { ReactNode } from "react";

/**
 * Page section wrappers.
 *
 * These used to be framer-motion entrance animations (staggered fade-in,
 * PAGES.md §5.3) that rendered their children at opacity 0 in the SSR HTML
 * and revealed them only after hydration. Under Lighthouse throttling that
 * pushed the LCP element's render past ~2s and cost the performance score.
 * They now render children directly so above-the-fold content paints in the
 * first HTML pass. The exports are unchanged so existing call sites keep
 * working; a page-load fade is deliberately dropped in favor of LCP.
 */
export function PageEntrance({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function PageEntranceItem({ children }: { children: ReactNode }) {
  return <>{children}</>;
}