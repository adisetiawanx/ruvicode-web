import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/shared/link-button";

export function CtaSection() {
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="content">
        <div className="rounded-xl border border-border-default bg-surface p-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold">
            Ready to simplify your AI API access?
          </h2>
          <p className="mb-8 text-text-secondary">
            Join developers building with one key, transparent pricing, and hard
            spend limits.
          </p>
          <LinkButton href="/register" variant="primary" size="lg">
            Get Started Free →
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
