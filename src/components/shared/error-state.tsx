"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryAction?: () => void;
}

/**
 * Reusable error state component (PAGES.md §15.2).
 * Never exposes stack traces or internal IDs — generic message only.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again.",
  retryAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-error/30 bg-error-subtle">
        <AlertCircle className="h-8 w-8 text-error" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {retryAction && (
        <Button variant="outline" size="sm" onClick={retryAction}>
          Try Again
        </Button>
      )}
    </div>
  );
}
