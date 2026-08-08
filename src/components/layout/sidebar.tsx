"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  CreditCard,
  Wallet,
  Settings,
  Menu,
  LogOut,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { LinkButton } from "@/components/shared/link-button";
import { authClient } from "@/lib/auth-client";
import { BalanceRefreshButton } from "@/components/dashboard/balance-refresh-button";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/topup", label: "Top Up", icon: Wallet },
  { href: "/dashboard/models", label: "Models & Pricing", icon: Tags },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** Desktop sidebar (persistent, md+). */
export function DashboardSidebar({
  balance,
  userId,
}: {
  balance: string;
  userId: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border-subtle bg-canvas md:flex">
      <SidebarContent pathname={pathname} balance={balance} userId={userId} />
    </aside>
  );
}

/** Mobile sidebar trigger + slide-in sheet. */
export function MobileSidebarTrigger({
  balance,
  userId,
}: {
  balance: string;
  userId: string;
}) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 bg-canvas p-0">
        <SidebarContent pathname={pathname} balance={balance} userId={userId} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({
  pathname,
  balance,
  userId,
}: {
  pathname: string;
  balance: string;
  userId: string;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo header */}
      <div className="flex h-16 items-center border-b border-border-subtle px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold">Ruvicode</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent-subtle text-accent-text"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="px-3 pb-1">
        <button
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Balance card at bottom */}
      <BalanceSidebarCard balance={balance} userId={userId} />
    </div>
  );
}

function BalanceSidebarCard({
  balance,
  userId,
}: {
  balance: string;
  userId: string;
}) {
  return (
    <div className="border-t border-border-subtle p-3">
      <div className="space-y-2 rounded-lg bg-surface p-4">
        <p className="text-xs text-text-secondary">Balance</p>
        <BalanceRefreshButton initialBalance={balance} userId={userId} />
        <LinkButton
          href="/dashboard/topup"
          variant="primary"
          size="sm"
          className="w-full"
        >
          Top Up
        </LinkButton>
      </div>
    </div>
  );
}
