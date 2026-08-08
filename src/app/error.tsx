"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

/**
 * Global error boundary (ADR-012 §4).
 * Catches unhandled errors in any route segment.
 * Logs to console (MVP) — will forward to Sentry/Axiom in production.
 *
 * SECURITY: Does NOT expose stack trace or error.message to the user.
 * Only generic message + retry action.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to observability (console for MVP, Sentry/Axiom later)
    console.error("Global error boundary:", error.digest ?? "unknown error");
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. Our team has been notified. You can try again."
        retryAction={reset}
      />
    </div>
  );
}
