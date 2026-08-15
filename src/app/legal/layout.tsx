import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";

/**
 * Shared layout for all legal pages — consistent typography container
 * plus a back link so readers are never stranded at the page bottom.
 * Per PAGES.md §13.10 and ADR-011 §1.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container size="content" className="py-12">
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        {children}
      </div>
    </Container>
  );
}
