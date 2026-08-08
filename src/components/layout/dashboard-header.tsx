"use client";

import Link from "next/link";
import { MobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BalanceRefreshButton } from "@/components/dashboard/balance-refresh-button";

/**
 * Dashboard top bar — always visible (mobile + desktop).
 * Mobile: hamburger + wordmark + balance + theme toggle + logout.
 * Desktop: balance (right-aligned) + theme toggle + logout.
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
        <MobileSidebarTrigger balance={balance} userId={userId} />
        <Link href="/dashboard" className="md:hidden">
          <span className="font-semibold">Ruvicode</span>
        </Link>
      </div>

      {/* Right: balance + theme toggle + logout */}
      <div className="flex items-center gap-3">
        <BalanceRefreshButton initialBalance={balance} userId={userId} />
        <ThemeToggle />
        <button
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
