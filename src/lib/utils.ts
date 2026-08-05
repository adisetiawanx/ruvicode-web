import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names without conflicts.
 * Used by every shadcn/ui component and custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
