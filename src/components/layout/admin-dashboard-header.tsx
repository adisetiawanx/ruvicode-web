"use client";

import Link from "next/link";
import { AdminMobileSidebarTrigger } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AdminDashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-2">
        <AdminMobileSidebarTrigger />
        <Link href="/super" className="md:hidden">
          <span className="font-semibold">Ruvicode</span>
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
}
