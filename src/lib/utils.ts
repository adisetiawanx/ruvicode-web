import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Display label for a topup method. Stored values are lowercase enum
 * strings ("usdc", "idr"); "usdc" is a currency ticker and must
 * render uppercase in customer-facing copy. Legacy rows may still
 * carry "paddle" from the removed card flow; render them as Card.
 */
export function formatTopupMethod(method: string): string {
  if (method.toLowerCase() === "usdc") return "USDC";
  if (method.toLowerCase() === "idr") return "IDR";
  if (method.toLowerCase() === "manual") return "Adjustment";
  if (method.toLowerCase() === "paddle") return "Card";
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}

/**
 * Merge Tailwind class names without conflicts.
 * Used by every shadcn/ui component and custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
