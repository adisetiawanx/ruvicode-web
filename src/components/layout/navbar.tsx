"use client";

import { useState } from "react";
import { CommandPalette } from "@/components/shared/command-palette";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { LinkButton } from "@/components/shared/link-button";

const navLinks = [
  { href: "/models", label: "Models" },
  { href: "/playground", label: "Playground" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Ruvicode</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <LinkButton href="/register" variant="primary" size="sm">
              Get Started
            </LinkButton>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-canvas">
                <div className="flex flex-col gap-6 pt-6">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                      <Logo />
                      <span className="font-semibold">Ruvicode</span>
                    </Link>
                    <SheetClose
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <X className="h-5 w-5" />
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <SheetClose
                        key={link.href}
                        render={<Link href={link.href} />}
                      >
                        <span className="text-base text-text-secondary hover:text-text-primary">
                          {link.label}
                        </span>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
                    <LinkButton href="/register" variant="primary">
                      Get Started
                    </LinkButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
