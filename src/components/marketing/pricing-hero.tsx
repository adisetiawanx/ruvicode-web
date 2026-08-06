import { Container } from "@/components/layout/container";

export function PricingHero() {
  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <div className="text-center">
          <span className="inline-block rounded-full border border-border-default bg-surface px-3 py-1 text-xs text-text-secondary">
            Transparent Pricing
          </span>
          <h1 className="mt-6 text-h1 font-bold">
            Transparent Pricing.
            <br />
            <span className="text-accent">No Hidden Fees.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            See exact per-request pricing for every model. No opaque credit
            conversion, no surprise charges. Just clear $/1M token rates and real
            savings versus OpenRouter.
          </p>
        </div>
      </Container>
    </section>
  );
}
