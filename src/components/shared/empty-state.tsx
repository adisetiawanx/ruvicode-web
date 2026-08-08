import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Reusable empty state component (PAGES.md §15.1).
 * Minimal line-art icons in Clay accent, NOT emoji or stock illustrations.
 * Uses semantic HTML (<h3>, <p>) for SEO/accessibility.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent-subtle">
        <Icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover active:bg-accent-pressed"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
