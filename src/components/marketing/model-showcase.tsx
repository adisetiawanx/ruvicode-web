import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { SHOWCASE_MODELS } from "@/lib/constants";

/**
 * Professional model cards grid.
 * Shows: provider badge, model name, input/output per-1M pricing,
 * savings badge, context window.
 * Replaces the old horizontal scroll strip with a proper grid.
 */
export function ModelShowcase() {
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
          {SHOWCASE_MODELS.map((m) => (
            <div
              key={m.model}
              className="group flex flex-col rounded-xl border border-border-default bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-card"
            >
              {/* Header: provider badge + savings */}
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" className="text-xs text-text-secondary">
                  {m.provider}
                </Badge>
                <span className="font-mono text-xs font-medium text-success">
                  −{m.savings_pct}%
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

              {/* Footer: context window */}
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-muted">
                <span>Context</span>
                <span className="font-mono">{m.context}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Format price — shows more decimals for very cheap models (< $1). */
function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(3);
  return price.toFixed(2);
}
