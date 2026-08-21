/**
 * Google Analytics event tracking utility.
 *
 * The gtag snippet in layout.tsx handles automatic pageviews. This module
 * provides typed helpers for custom events that matter to a SaaS funnel:
 * sign-ups, logins, top-ups, key creation, playground usage, model views.
 *
 * All helpers are silently no-op when gtag is not loaded (local dev, ad
 * blockers), so calling code never needs to guard. trackEvent pushes to
 * window.dataLayer only, no network calls and no extra bundle weight, so
 * page performance is unaffected.
 *
 * Events that fire before the gtag script finishes loading are queued in
 * the shared dataLayer and flushed once gtag initializes (gtag itself
 * consumes window.dataLayer, so entries pushed before init are picked up
 * automatically).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = {
  [key: string]: string | number | boolean | undefined;
};

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;

  // Pushing directly onto dataLayer works whether or not the gtag script
  // has finished loading: gtag drains the array on init. This is the same
  // mechanism the inline snippet uses.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", name, params ?? {}]);
}

// ── Auth events ──────────────────────────────────────────────────────

/** Track a completed registration (first sign-up). */
export function trackSignUp(method: "google" | "github" | "email"): void {
  trackEvent("sign_up", { method });
}

/** Track a returning user login. */
export function trackLogin(method: "google" | "github" | "email"): void {
  trackEvent("login", { method });
}

// ── Revenue events ───────────────────────────────────────────────────

/** Track when a user initiates a top-up (clicks checkout). */
export function trackTopUpInitiated(
  amountUsd: number,
  method: "card" | "crypto",
): void {
  trackEvent("begin_checkout", {
    value: amountUsd,
    currency: "USD",
    method,
  });
}

/**
 * Track a completed top-up on the client (e.g. returning from checkout).
 * Server-side completion (webhooks) needs the GA Measurement Protocol.
 */
export function trackTopUpCompleted(
  amountUsd: number,
  method: "card" | "crypto",
): void {
  trackEvent("purchase", {
    value: amountUsd,
    currency: "USD",
    method,
  });
}

// ── Product engagement events ────────────────────────────────────────

/** Track API key creation. */
export function trackKeyCreated(): void {
  trackEvent("generate_lead", { item: "api_key" });
}

/** Track a playground message sent (free public or dashboard). */
export function trackPlaygroundMessage(source: "public" | "dashboard"): void {
  trackEvent("playground_message", { source });
}

/** Track a model detail page view (user browsing the catalog). */
export function trackModelView(modelSlug: string): void {
  trackEvent("view_item", { item_id: modelSlug, item_category: "model" });
}

/** Track calculator engagement (first interaction). */
export function trackCalculatorUse(): void {
  trackEvent("engage_calculator");
}

/** Track docs page view (user reading documentation). */
export function trackDocsView(docSlug: string): void {
  trackEvent("view_docs", { doc_slug: docSlug });
}
