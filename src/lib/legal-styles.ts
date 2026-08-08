import { cn } from "@/lib/utils";

/**
 * Shared prose styles for legal pages.
 * Uses Tailwind arbitrary variant selectors to style nested HTML
 * (h2, h3, p, ul, ol, a, strong) within the legal content container.
 *
 * Per PAGES.md §13.10: "plain text on branded page."
 */
export const legalProseStyles = cn(
  "max-w-none",
  // Headings
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text-primary",
  // Paragraphs
  "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-text-secondary",
  // Lists
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-text-secondary",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ol]:text-text-secondary",
  // Links
  "[&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-accent-hover",
  // Strong
  "[&_strong]:font-semibold [&_strong]:text-text-primary",
);
