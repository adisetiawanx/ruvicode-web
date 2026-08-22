"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

/**
 * Small copy-to-clipboard button for EVM addresses in the admin users table.
 * Shows a check icon briefly after copying.
 */
export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 inline-flex items-center text-text-muted transition-colors hover:text-accent-text"
      title="Copy wallet address"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}
