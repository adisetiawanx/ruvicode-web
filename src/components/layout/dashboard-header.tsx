"use client";

import Link from "next/link";
import { MobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Dashboard top bar — always visible (mobile + desktop).
 * Mobile: hamburger + wordmark + theme toggle.
 * Desktop: platform token counter + theme toggle.
 *
 * Balance is shown ONLY on the Overview and Billing pages (not here).
 * Sign out is in the sidebar only.
 */
export function DashboardHeader({
  totalTokensServed,
}: {
  totalTokensServed?: number;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: mobile hamburger + wordmark / desktop: token counter */}
      <div className="flex items-center gap-2">
        <MobileSidebarTrigger />
        <Link href="/" className="md:hidden">
          <span className="font-semibold">Ruvicode</span>
        </Link>
        {typeof totalTokensServed === "number" &&
          totalTokensServed > 0 && (
            <span
              className="hidden items-center gap-1.5 font-mono text-xs text-text-muted md:flex"
              title="Total tokens served by Ruvicode"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              {totalTokensServed.toLocaleString("en-US")} tokens served
            </span>
          )}
      </div>

      {/* Right: theme toggle */}
      <ThemeToggle />
    </header>
  );
}
