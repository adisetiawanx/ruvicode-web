import { Container } from "@/components/layout/container";
import { BadgeCheck, Scale, Wallet } from "lucide-react";

/**
 * "Why our pricing is cheaper" — a value-first story. We deliberately do
 * NOT spell out internal margin mechanics here; the section answers the
 * buyer's actual question (why is it cheaper, is it safe) in three beats.
 */
export function HowPricingWorks() {
  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="wide">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-semibold">
            Honest pricing, no catch
          </h2>
          <p className="text-text-secondary">
            Real market rates for the same frontier models, billed per
            request. Nothing hidden in the fine print.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Beat 1: why cheaper */}
          <div className="rounded-xl border border-border-default bg-surface p-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-subtle">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              We buy where inference is cheapest
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              A competitive marketplace of inference providers bids on every
              request, so capacity is sourced far below list prices. Those
              savings become your price, not our markup story.
            </p>
          </div>

          {/* Beat 2: what you see */}
          <div className="rounded-xl border border-border-default bg-surface p-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-subtle">
              <BadgeCheck className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              The price you see is the price you pay
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Every model card shows live $/1M token rates and every response
              carries an exact cost header. No credit conversion, no surprise
              fees, no opaque multipliers.
            </p>
          </div>

          {/* Beat 3: what you keep */}
          <div className="rounded-xl border border-accent/25 bg-surface p-8 shadow-card">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-subtle">
              <Wallet className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Save up to 99% vs list price
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Same models, same OpenAI-compatible API, a fraction of the
              reference price. Balance never expires and there are no
              minimums.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
