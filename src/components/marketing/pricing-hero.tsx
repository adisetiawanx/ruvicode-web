import { Container } from "@/components/layout/container";

export function PricingHero() {
  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-subtle px-3 py-1 text-xs font-medium text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
            </span>
            Realtime Pricing
          </span>
          <h1 className="mt-6 text-h1 font-bold">
            Every model. Real prices.
            <br />
            <span className="text-accent">No catch.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            See exact per-request pricing for every model, updated every 2
            minutes. No credit conversion, no surprise charges. Just clear
            $/1M token rates and honest savings versus official provider
            pricing.
          </p>
        </div>
      </Container>
    </section>
  );
}
