"use client";

import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getWallet } from "@/lib/db/queries/dashboard";

interface BalanceRefreshButtonProps {
  initialBalance: string;
  userId: string;
}

/**
 * Wallet balance display with refresh button (ADR-009).
 *
 * Anti-spam: 10-second cooldown between refreshes.
 * Shows spinner during refresh. Toast on success.
 *
 * Balance number NEVER animates (PAGES.md §5.4) — appears instantly.
 */
export function BalanceRefreshButton({
  initialBalance,
  userId,
}: BalanceRefreshButtonProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [loading, setLoading] = useState(false);
  const lastRefresh = useRef(0);

  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefresh.current < 10_000) {
      toast.info("Please wait a few seconds before refreshing again.");
      return;
    }
    lastRefresh.current = now;
    setLoading(true);
    try {
      const wallet = await getWallet(userId);
      setBalance(wallet.balance);
    } catch {
      // Silently fail — don't disturb user for balance refresh errors
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-1.5 font-mono text-sm tabular text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
      aria-label="Refresh balance"
    >
      <span>${Number(balance).toFixed(2)}</span>
      <RefreshCw
        className={`h-3 w-3 text-text-muted transition-transform ${
          loading ? "animate-spin" : ""
        }`}
      />
    </button>
  );
}
