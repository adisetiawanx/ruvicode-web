"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Theme provider wrapping next-themes.
 *
 * - Uses `data-theme` attribute on <html> (matches ADR-002 no-FOUC script)
 * - localStorage key: "ruvicode-theme" (per ADR-002 spec)
 * - Default: dark mode
 * - No system preference detection (explicit user choice only, per PAGES.md §2.3)
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      storageKey="ruvicode-theme"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
