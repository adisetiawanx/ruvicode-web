"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a GA event on mount. Used from server components that cannot
 * call client-side tracking directly. Renders nothing.
 *
 * The paramsKey prop is a stable string (e.g. the model slug) so the
 * effect only fires once per unique value, not on every render.
 */
export function AnalyticsBeacon({
  event,
  params,
  paramsKey,
}: {
  event: string;
  params?: Record<string, string | number | boolean | undefined>;
  paramsKey?: string;
}) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, paramsKey]);

  return null;
}
