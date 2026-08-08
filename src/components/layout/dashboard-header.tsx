"use client";

import Link from "next/link";
import { MobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { BalanceRefreshButton } from "@/components/dashboard/balance-refresh-button";

/**
 * Dashboard top bar — always visible (mobile + desktop).
 * Mobile: hamburger + wordmark + balance + theme toggle.
 * Desktop: balance (right-aligned) + theme toggle.
 * Sign out is in the sidebar only (not here).
 */
export function DashboardHeader({
  balance,
  userId,
}: {
  balance: string;
  userId: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: mobile hamburger + wordmark */}
      <div className="flex items-center gap-2">
        <MobileSidebarTrigger />
        <Link href="/dashboard" className="md:hidden">
          <span className="font-semibold">Ruvicode</span>
        </Link>
      </div>

      {/* Right: balance + theme toggle */}
      <div className="flex items-center gap-3">
        <BalanceRefreshButton initialBalance={balance} userId={userId} />
        <ThemeToggle />
      </div>
    </header>
  );
}
