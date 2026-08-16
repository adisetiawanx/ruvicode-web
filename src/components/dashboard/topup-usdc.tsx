"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Coins, AlertTriangle, Wallet, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface TopUpUSDCProps {
  address: string;
}

export function TopUpUSDC({ address }: TopUpUSDCProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(address, {
      width: 192,
      margin: 1,
      color: {
        dark: "#0F0F0E",
        light: "#FAF9F5",
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

      {/* QR Code */}
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

      {/* How it works */}
      <div className="mb-4 space-y-2.5 rounded-md border border-border-subtle bg-surface-2 p-4">
        <div className="flex items-start gap-2">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-medium text-text-primary">Unique per user</p>
            <p className="text-xs text-text-muted">
              This address is yours alone, derived from a secure HD wallet.
              Every Ruvicode user gets a different address.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-medium text-text-primary">Auto-credited</p>
            <p className="text-xs text-text-muted">
              Deposits are detected on-chain and credited to your wallet
              automatically after 3 block confirmations, usually within
              a minute. No need to contact support or click anything.
            </p>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="space-y-1 text-xs text-text-muted">
        <p>
          Network: <span className="font-mono text-text-secondary">Base (Chain ID 8453)</span>
        </p>
        <p>
          Token: <span className="font-mono text-text-secondary">USDC</span>
        </p>
        <p>
          Minimum deposit: <span className="font-mono text-text-secondary">$0.01</span>
        </p>
        <p>
          Confirmations: <span className="font-mono text-text-secondary">3 blocks (~30 sec)</span>
        </p>
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-warning-subtle p-2 text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Only send USDC on the Base network.</strong> Sending
            other tokens or using a different network will result in
            permanent loss.
          </span>
        </div>
      </div>
    </div>
  );
}
