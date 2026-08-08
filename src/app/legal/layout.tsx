import { Container } from "@/components/layout/container";

/**
 * Shared layout for all legal pages — consistent typography container.
 * Per PAGES.md §13.10 and ADR-011 §1.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container size="content" className="py-12">
      <div className="mx-auto max-w-[680px]">{children}</div>
    </Container>
  );
}
