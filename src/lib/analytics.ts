/**
 * Google Analytics event tracking utility.
 *
 * The gtag snippet in layout.tsx handles automatic pageviews. This module
 * provides a typed `trackEvent` helper for custom events that matter to a
 * SaaS funnel: sign-ups, top-ups, key creation, playground usage, etc.
 *
 * Events are silently no-op when gtag is not loaded (local dev, ad blockers,
 * or before the script finishes loading), so calling code never needs to
 * guard.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = {
  [key: string]: string | number | boolean | undefined;
};

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  window.gtag("event", name, params);
}

/**
 * Track a completed registration.
 */
export function trackSignUp(method: "google" | "github" | "email"): void {
  trackEvent("sign_up", { method });
}

/**
 * Track a wallet top-up.
 */
export function trackTopUp(amountUsd: number, method: "card" | "crypto"): void {
  trackEvent("top_up", {
    value: amountUsd,
    currency: "USD",
    method,
  });
}

/**
 * Track API key creation.
 */
export function trackKeyCreated(): void {
  trackEvent("create_key");
}

/**
 * Track a playground message sent (free public playground).
 */
export function trackPlaygroundMessage(): void {
  trackEvent("playground_message");
}
