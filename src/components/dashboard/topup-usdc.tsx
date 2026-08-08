"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Coins, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface TopUpUSDCProps {
  address: string;
}

export function TopUpUSDC({ address }: TopUpUSDCProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Generate QR code from deposit address on mount
  useEffect(() => {
    QRCode.toDataURL(address, {
      width: 192,
      margin: 1,
      color: {
        dark: "#0F0F0E", // warm near-black
        light: "#FAF9F5", // ivory
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [address]);

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

      {/* QR Code — scan with mobile wallet to deposit */}
      <div className="mb-4 flex justify-center">
        <div className="rounded-lg border border-border-default bg-canvas p-3">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Deposit address QR code"
              className="h-44 w-44 rounded"
              width={176}
              height={176}
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-accent" />
            </div>
          )}
        </div>
      </div>
      <p className="mb-4 text-center text-xs text-text-muted">
        Scan with your wallet app to deposit
      </p>

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
