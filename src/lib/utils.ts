import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Display label for a topup method. Stored values are lowercase enum
 * strings ("usdc", "paddle"); "usdc" is a currency ticker and must
 * render uppercase in customer-facing copy.
 */
export function formatTopupMethod(method: string): string {
  if (method.toLowerCase() === "usdc") return "USDC";
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}

/**
 * Merge Tailwind class names without conflicts.
 * Used by every shadcn/ui component and custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
