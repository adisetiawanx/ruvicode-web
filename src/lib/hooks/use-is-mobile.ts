"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether the viewport is mobile (≤768px).
 * Used to skip entrance animations on mobile for Lighthouse performance.
 *
 * Returns false during SSR and on the first client render, then updates
 * after mount. This avoids hydration mismatches — the server always
 * renders the "desktop" path, and the client corrects after mount.
 *
 * The key insight: we only use this to decide whether to pass
 * `initial={false}` to framer-motion. On mobile, the animation is
 * skipped entirely (content appears instantly from SSR HTML), which
 * fixes the LCP bottleneck caused by `opacity: 0` initial states.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
