"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// Empty external store — only used to detect client-side mount without
// calling setState inside useEffect (avoids React 19 lint rule).
const emptySubscribe = () => () => {};

/**
 * Theme toggle button (sun/moon icon).
 *
 * Uses next-themes (wrapped by ThemeProvider) which persists to
 * localStorage key "ruvicode-theme" and sets `data-theme` on <html>.
 *
 * useSyncExternalStore returns false during SSR and true after hydration,
 * acting as a mount guard without setState-in-effect.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <Sun className="h-5 w-5 opacity-0" />
      )}
    </Button>
  );
}
