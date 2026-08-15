"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { displayModelName } from "@/lib/models/display";

/**
 * Model name plus its API id in a copyable chip. The id is what users
 * must send as "model" in API requests. Clicking the chip copies the id;
 * inside links the click does not navigate (stopPropagation).
 */
export function ModelTag({
  id,
  className,
  showName = true,
}: {
  id: string;
  className?: string;
  showName?: boolean;
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
    <span className={`inline-flex max-w-full flex-col items-start gap-1 ${className ?? ""}`}>
      {showName && (
        <span className="truncate font-medium">{displayModelName(id)}</span>
      )}
      <button
        type="button"
        onClick={copy}
        title={`Copy model id: ${id}`}
        className="group inline-flex max-w-full shrink-0 items-center gap-1 rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-text-muted transition-colors hover:border-accent/40 hover:text-accent-text"
      >
        <span className="truncate">{id}</span>
        {copied ? (
          <Check className="h-3 w-3 shrink-0 text-success" />
        ) : (
          <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </span>
  );
}
