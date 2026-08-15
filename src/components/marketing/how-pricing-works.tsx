import { Container } from "@/components/layout/container";
import { ArrowRight } from "lucide-react";

/**
 * "How pricing works" with a concrete worked example instead of four
 * abstract cards. The numbers mirror the real pricing engine:
 * reference (OpenRouter list) -> marketplace cost -> user price with a
 * 20pp spread -> what the user saves.
 *
 * Example model: glm-5.2 input token pricing (live values).
 */
export function HowPricingWorks() {
  const ref = 1.1; // OpenRouter reference, $/1M input
  const market = 0.028; // marketplace sourcing cost
  const user = 0.218; // Ruvicode price after the spread

  const pct = (v: number) => `${Math.round((1 - v / ref) * 100)}%`;

  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="wide">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-semibold">How pricing works</h2>
          <p className="text-text-secondary">
            Live market pricing, the same math on every request. Here is a
            real example using GLM-5.2 input tokens.
          </p>
        </div>

        {/* The math, as a flow */}
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* Step 1: reference */}
          <div className="rounded-xl border border-border-default bg-surface p-6">
            <p className="mb-1 font-mono text-xs text-text-muted">STEP 01</p>
            <h3 className="mb-2 text-lg font-semibold">Reference price</h3>
            <p className="mb-5 text-sm text-text-secondary">
              OpenRouter&apos;s published rate. The industry benchmark.
            </p>
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
              <p className="text-xs text-text-muted">GLM-5.2 / 1M input</p>
              <p className="font-mono text-2xl font-semibold tabular text-text-primary">
                ${ref.toFixed(2)}
              </p>
            </div>
          </div>

          <ArrowRight
            className="hidden h-5 w-5 shrink-0 self-center text-text-muted lg:block"
            aria-hidden
          />

          {/* Step 2: marketplace sourcing */}
          <div className="rounded-xl border border-border-default bg-surface p-6">
            <p className="mb-1 font-mono text-xs text-text-muted">STEP 02</p>
            <h3 className="mb-2 text-lg font-semibold">We source cheaper</h3>
            <p className="mb-5 text-sm text-text-secondary">
              A competitive marketplace of inference sellers bids for every
              request, 35 to 99% below reference.
            </p>
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
              <p className="text-xs text-text-muted">Our cost</p>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-2xl font-semibold tabular text-text-primary">
                  ${market.toFixed(3)}
                </p>
                <span className="rounded-full bg-success-subtle px-2 py-0.5 font-mono text-xs text-success">
                  −97% vs ref
                </span>
              </div>
            </div>
          </div>

          <ArrowRight
            className="hidden h-5 w-5 shrink-0 self-center text-text-muted lg:block"
            aria-hidden
          />

          {/* Step 3: user price */}
          <div className="rounded-xl border border-accent/30 bg-surface p-6 shadow-card">
            <p className="mb-1 font-mono text-xs text-accent-text">STEP 03</p>
            <h3 className="mb-2 text-lg font-semibold">Your price</h3>
            <p className="mb-5 text-sm text-text-secondary">
              We keep a fixed 20-point spread over sourcing cost and pass the
              rest of the discount to you.
            </p>
            <div className="rounded-lg border border-accent/20 bg-accent-subtle p-4">
              <p className="text-xs text-text-muted">You pay</p>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-2xl font-semibold tabular text-text-primary">
                  ${user.toFixed(3)}
                </p>
                <span className="rounded-full bg-success-subtle px-2 py-0.5 font-mono text-xs text-success">
                  −{pct(user)} vs ref
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The bar that shows the split */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
            <span>Where every dollar of reference price goes</span>
            <span className="font-mono">GLM-5.2 · $1.10/1M</span>
          </div>
          <div className="flex h-9 w-full overflow-hidden rounded-lg border border-border-default">
            <div
              className="flex items-center justify-center bg-accent/80 font-mono text-xs text-text-inverse"
              style={{ width: `${(user / ref) * 100}%` }}
            >
              ${(user).toFixed(2)} you pay
            </div>
            <div
              className="flex items-center justify-center bg-success/60 font-mono text-[10px] text-text-primary"
              style={{ width: `${((ref - user - market) / ref) * 100}%` }}
              title="Ruvicode margin keeps the service running"
            >
              spread
            </div>
            <div
              className="flex items-center justify-center bg-surface-2 font-mono text-[10px] text-text-muted"
              style={{ width: `${(market / ref) * 100}%` }}
              title="Not charged to you"
            >
              market savings
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            You save 80% versus the reference rate. The spread funds the
            gateway; market savings stay in your pocket.
          </p>
        </div>
      </Container>
    </section>
  );
}
