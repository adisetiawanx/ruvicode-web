"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface DocsNavGroup {
  section: string;
  items: Array<{ slug: string; title: string }>;
}

/**
 * Mobile docs navigation drawer. The desktop sidebar is hidden below lg,
 * so this sheet provides the same navigation on small screens. It appears
 * as a floating button above the docs content.
 */
export function MobileDocsNav({ nav }: { nav: DocsNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="mb-6 lg:hidden"
            aria-label="Open docs navigation"
          />
        }
      >
        <BookOpen className="h-4 w-4" />
        Docs menu
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-canvas overflow-y-auto">
        <SheetTitle className="px-4 pt-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Documentation
        </SheetTitle>
        <nav className="space-y-6 p-4">
          {nav.map((group) => (
            <div key={group.section}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {group.section}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === `/docs/${item.slug}`;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-accent-subtle text-accent-text"
                            : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                        }`}
                      >
                        {item.title}
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
