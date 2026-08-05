"use client";

import Link from "next/link";
import { MobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Mobile-only top bar for the dashboard.
 * Shows hamburger (→ sidebar sheet), wordmark, balance, and theme toggle.
 * Hidden on md+ where the persistent sidebar lives.
 */
export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border-subtle bg-canvas/80 backdrop-blur-md md:hidden">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MobileSidebarTrigger />
          <Link href="/dashboard">
            <span className="font-semibold">Ruvicode</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tabular text-text-secondary">
            $12.50
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
