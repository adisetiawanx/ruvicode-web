import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/**
 * Custom MDX components — available inside MDX files automatically.
 * Styles MDX-rendered content with the Ruvicode design system.
 */

export const mdxComponents = {
  // Style links with accent color
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <Link
      href={href ?? "#"}
      className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={href?.startsWith("http") ? "_blank" : undefined}
    >
      {children}
    </Link>
  ),

  // Code blocks — Shiki handles highlighting via rehype-pretty-code
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-6 overflow-x-auto rounded-lg border border-border-default bg-inset p-4 text-sm">
      {children}
    </pre>
  ),

  // Inline code
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const isInline = !className?.includes("language-");
    if (!isInline) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-accent-text">
        {children}
      </code>
    );
  },

  // Headings
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 mt-10 text-h1 font-bold">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-8 text-h2 font-semibold">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-6 text-h3 font-semibold">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 leading-relaxed text-text-secondary">{children}</p>
  ),

  // Lists
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-text-secondary">
      {children}
    </ol>
  ),

  // Blockquote
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-accent pl-4 italic text-text-secondary">
      {children}
    </blockquote>
  ),

  // Table
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-border-default bg-surface px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-border-default px-4 py-2 text-text-secondary">
      {children}
    </td>
  ),

  // Badge component available in MDX
  Badge,
} as const;
