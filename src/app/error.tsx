"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Something went wrong.</h1>
      <p className="mb-8 max-w-md text-text-secondary">
        An unexpected error occurred. You can try again.
      </p>
      <Button variant="primary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
