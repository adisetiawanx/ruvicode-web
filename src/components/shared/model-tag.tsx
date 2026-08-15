"use client";

import { useState } from "react";
import { displayModelName } from "@/lib/models/display";

/**
 * Model name plus its API id. The id is what users must send as "model"
 * in API requests. Clicking the id copies it; inside links the click does
 * not navigate (stopPropagation).
 *
 * `stacked` (default) puts the id under the name for cards and showcase;
 * set stacked={false} for dense table rows where it sits beside the name.
 */
export function ModelTag({
  id,
  className,
  showName = true,
  stacked = true,
}: {
  id: string;
  className?: string;
  showName?: boolean;
  stacked?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span
      className={`inline-flex max-w-full ${stacked ? "flex-col items-start gap-1" : "items-center gap-2"} ${className ?? ""}`}
    >
      {showName && (
        <span className="truncate font-medium">{displayModelName(id)}</span>
      )}
      <button
        type="button"
        onClick={copy}
        title={copied ? "Copied!" : `Copy model id: ${id}`}
        className={`inline-flex max-w-full shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
          copied
            ? "border-success/40 bg-success-subtle text-success"
            : "border-border-subtle bg-surface-2 text-text-muted hover:border-accent/40 hover:text-accent-text"
        }`}
      >
        <span className="truncate">{id}</span>
      </button>
    </span>
  );
}
