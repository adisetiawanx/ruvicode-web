"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Boxes,
  FlaskConical,
  Calculator,
  BookOpen,
  Newspaper,
  Plug,
  Activity,
  KeyRound,
  LayoutDashboard,
  LogIn,
} from "lucide-react";

const PAGES = [
  { href: "/", label: "Home", icon: Home, hint: "Landing page" },
  { href: "/models", label: "Models", icon: Boxes, hint: "Catalog with live pricing" },
  { href: "/playground", label: "Playground", icon: FlaskConical, hint: "Try models free" },
  { href: "/calculator", label: "Cost Calculator", icon: Calculator, hint: "Estimate savings" },
  { href: "/docs", label: "Docs", icon: BookOpen, hint: "API reference" },
  { href: "/blog", label: "Blog", icon: Newspaper, hint: "Guides and comparisons" },
  { href: "/integrations", label: "Integrations", icon: Plug, hint: "Cursor, Aider, LangChain" },
  { href: "/status", label: "Status", icon: Activity, hint: "System health" },
];

const ACCOUNT = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Overview and usage" },
  { href: "/dashboard/keys", label: "API Keys", icon: KeyRound, hint: "Create and manage keys" },
  { href: "/login", label: "Sign in", icon: LogIn, hint: "Log into your account" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  // No visible trigger button: the palette opens via Ctrl/Cmd+K only,
  // keeping the navbar minimal.
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              <p.icon className="mr-2 h-4 w-4" />
              <span>{p.label}</span>
              <span className="ml-auto text-xs text-text-muted">{p.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          {ACCOUNT.map((p) => (
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              <p.icon className="mr-2 h-4 w-4" />
              <span>{p.label}</span>
              <span className="ml-auto text-xs text-text-muted">{p.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
