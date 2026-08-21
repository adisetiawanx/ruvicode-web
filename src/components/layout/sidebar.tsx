"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, ClipboardList, CreditCard, FlaskConical, Key, LayoutDashboard, LogOut, Menu, Settings, Tags, Users, Wallet, Wrench, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { authClient } from "@/lib/auth-client";

interface NavItem { href: string; label: string; icon: LucideIcon }

const customerItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/topup", label: "Top Up", icon: Wallet },
  { href: "/dashboard/models", label: "Models & Pricing", icon: Tags },
  { href: "/dashboard/playground", label: "Playground", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminItems: NavItem[] = [
  { href: "/super", label: "Overview", icon: LayoutDashboard },
  { href: "/super/users", label: "Users", icon: Users },
  { href: "/super/financial", label: "Financial", icon: CreditCard },
  { href: "/super/usage", label: "Usage", icon: BarChart3 },
  { href: "/super/tools", label: "Tools", icon: Wrench },
  { href: "/super/models", label: "Models", icon: Tags },
  { href: "/super/audit", label: "Audit Log", icon: ClipboardList },
];

export function DashboardSidebar() { return <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border-subtle bg-canvas md:flex"><SidebarContent pathname={usePathname()} items={customerItems} /></aside>; }
export function AdminDashboardSidebar() { return <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border-subtle bg-canvas md:flex"><AdminSidebarContent pathname={usePathname()} /></aside>; }
export function MobileSidebarTrigger() { return <MobileSheet pathname={usePathname()} items={customerItems} label="Open navigation menu" />; }
export function AdminMobileSidebarTrigger() { return <MobileSheet pathname={usePathname()} items={adminItems} admin label="Open admin navigation menu" />; }

function MobileSheet({ pathname, items, admin, label }: { pathname: string; items: NavItem[]; admin?: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label={label} />}><Menu className="h-5 w-5" /></SheetTrigger><SheetContent side="left" className="w-60 bg-canvas p-0" showCloseButton={false}>
    <div className="flex h-16 items-center justify-between border-b border-border-subtle px-5">
      <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}><Logo /><span className="font-semibold">Ruvicode</span></Link>
      <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close menu" />}><X className="h-5 w-5" /></SheetClose>
    </div>
    {admin ? <AdminSidebarContent pathname={pathname} onNavigate={() => setOpen(false)} /> : <SidebarContent pathname={pathname} items={items} onNavigate={() => setOpen(false)} />}
  </SheetContent></Sheet>;
}

function SidebarContent({ pathname, items, onNavigate }: { pathname: string; items: NavItem[]; onNavigate?: () => void }) { return <div className="flex h-full flex-col"><div className="flex h-16 items-center border-b border-border-subtle px-6"><Link href="/" className="flex items-center gap-2"><Logo /><span className="font-semibold">Ruvicode</span></Link></div><nav className="flex-1 space-y-1 px-3 py-4">{items.map((item) => <NavLink key={item.href} pathname={pathname} item={item} root="/dashboard" />)}</nav><div className="border-t border-border-subtle p-3"><SignOut /></div></div>; }

function AdminSidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) { return <div className="flex h-full flex-col"><div className="flex h-16 items-center border-b border-border-subtle px-6"><Link href="/" className="flex items-center gap-2"><Logo /><span className="font-semibold">Ruvicode</span></Link></div><nav className="flex-1 space-y-1 px-3 py-5">{adminItems.map((item) => <NavLink key={item.href} pathname={pathname} item={item} root="/super" />)}</nav><div className="border-t border-border-subtle p-3"><SignOut /></div></div>; }

function NavLink({ pathname, item, root, onNavigate }: { pathname: string; item: NavItem; root: string; onNavigate?: () => void }) { const Icon = item.icon; const active = pathname === item.href || (item.href !== root && pathname.startsWith(`${item.href}/`)); return <Link href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-accent-subtle text-accent-text" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary")}><Icon className="h-4 w-4" />{item.label}</Link>; }
function SignOut() { return <button onClick={async () => { await authClient.signOut(); window.location.href = "/login"; }} className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"><LogOut className="h-4 w-4" />Sign Out</button>; }
