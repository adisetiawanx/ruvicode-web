"use client";

import { useState } from "react";
import { Copy, Check, Coins, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TopUpUSDCProps {
  address: string;
}

export function TopUpUSDC({ address }: TopUpUSDCProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-text-primary">Pay by USDC</h3>
      </div>

      {/* QR Code placeholder — in production, generate from address */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-border-default bg-canvas p-3">
          <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-border-strong text-center">
            <span className="px-4 text-xs text-text-muted">
              QR code will appear here
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-4 flex items-center gap-2 rounded-md border border-border-default bg-canvas p-3">
        <code className="flex-1 truncate font-mono text-xs text-text-primary">
          {address}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Copy deposit address"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1 text-xs text-text-muted">
        <p>
          • Network: <span className="font-mono">Base (Chain ID 8453)</span>
        </p>
        <p>
          • Token: <span className="font-mono">USDC</span>
        </p>
        <p>
          • Minimum deposit: <span className="font-mono">$1.00</span>
        </p>
        <p>• Auto-credited after 3 confirmations (~30 sec)</p>
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-warning-subtle p-2 text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Only send USDC on Base network.</strong> Other tokens or
            networks will be lost.
          </span>
        </div>
      </div>
    </div>
  );
}
