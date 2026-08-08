"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface KeyRevealProps {
  apiKey: string;
}

/**
 * One-time API key reveal with copy button and security warning.
 * The full key is NEVER retrievable again after this component unmounts.
 */
export function KeyReveal({ apiKey }: KeyRevealProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border-2 border-warning bg-warning-subtle p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-text-primary">
          <strong>Save this key securely.</strong> It will not be shown again.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-canvas p-3">
        <code className="flex-1 truncate font-mono text-sm text-text-primary">
          {apiKey}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Copy API key"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
