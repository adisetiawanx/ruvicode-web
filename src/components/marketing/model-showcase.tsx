import { getTopModels } from "@/lib/db/queries/models";
import { Container } from "@/components/layout/container";
import Link from "next/link";

/**
 * Featured model cards on the landing page.
 *
 * Live data from the curated catalog (never mock): the eight most
 * affordable curated models, straight from the pricing engine.
 */
// Request-time data: the landing page shell is static, but this section
// reads live prices, so it renders per request (dynamic hole).
export const revalidate = 0;

export async function ModelShowcase() {
  const models = (await getTopModels(8)).slice(0, 8);

  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="wide">
        <h2 className="mb-3 text-center text-3xl font-semibold">
          All your favorite models, one key away
        </h2>
        <p className="mb-12 text-center text-text-secondary">
          Transparent per-1M-token pricing. No hidden fees, no credit expiry.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m) => (
            <Link
              key={m.model}
              href={`/models/${m.model}`}
              className="group flex flex-col rounded-xl border border-border-default bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-card"
            >
              {/* Header: savings badge (upstream provider identity is masked) */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-text-muted">{m.provider}</span>
                <span className="font-mono text-xs font-medium text-success">
                  −{m.user_discount_pct.toFixed(0)}%
                </span>
              </div>

              {/* Model name */}
              <h3 className="mb-4 text-lg font-semibold">{m.display_name}</h3>

              {/* Pricing block */}
              <div className="mt-auto space-y-2 border-t border-border-subtle pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">Input</span>
                  <span className="font-mono tabular text-text-primary">
                    ${formatPrice(m.user_input)}
                    <span className="text-text-muted">/1M</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">Output</span>
                  <span className="font-mono tabular text-text-primary">
                    ${formatPrice(m.user_output)}
                    <span className="text-text-muted">/1M</span>
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-accent transition-colors group-hover:text-accent-hover">
                View details →
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          Plus more frontier and open models in the{" "}
          <Link
            href="/models"
            className="text-accent-text hover:text-accent-hover"
          >
            full catalog
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}

/** Format price — shows more decimals for very cheap models (< $1). */
function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(3);
  return price.toFixed(2);
}
