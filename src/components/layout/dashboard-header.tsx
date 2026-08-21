"use client";

import Link from "next/link";
import { MobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Dashboard top bar — always visible (mobile + desktop).
 * Mobile: hamburger + wordmark + theme toggle.
 * Desktop: theme toggle.
 *
 * Balance is shown ONLY on the Overview and Billing pages (not here).
 * Sign out is in the sidebar only.
 */
export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: mobile hamburger + wordmark */}
      <div className="flex items-center gap-2">
        <MobileSidebarTrigger />
        <Link href="/" className="md:hidden">
          <span className="font-semibold">Ruvicode</span>
        </Link>
      </div>

      {/* Right: theme toggle */}
      <ThemeToggle />
    </header>
  );
}
