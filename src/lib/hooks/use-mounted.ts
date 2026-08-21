"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 *
 * Used to make entrance animations SSR-safe: the server renders content
 * fully visible (no opacity:0), and the animation initial state is only
 * applied after mount when we know JS is running. This keeps crawlers
 * and headless snapshot tools (Google OAuth brand verification, search
 * engines) able to read the page content, while real users still get
 * the entrance animation.
 *
 * Pattern:
 *   const mounted = useMounted();
 *   <motion.div initial={mounted ? "hidden" : false} animate="show">
 *
 * The first client render matches the server HTML (visible), then the
 * effect flips `mounted` and framer-motion replays the entrance.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
