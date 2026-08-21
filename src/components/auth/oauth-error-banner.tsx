"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";

/**
 * Shows a dismissible banner when an OAuth sign-in fails and the provider
 * bounces back to the homepage with ?error=state_mismatch (typically the
 * callback was delayed past the state's short validity window, e.g. the
 * user paused on a browser warning page). Without this, the failure is
 * silent and the user just sees the homepage.
 */
export function OAuthErrorBanner() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const error = params.get("error");

  if (!mounted || !error || !visible) return null;

  const message =
    error === "state_mismatch"
      ? "Sign-in could not be completed because the request took too long or was opened in a different browser. Please try signing in again."
      : "Something went wrong during sign-in. Please try again.";

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 border-b border-error/30 bg-error-subtle px-4 py-3 text-sm text-error"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="ml-2 rounded p-1 hover:bg-error/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
