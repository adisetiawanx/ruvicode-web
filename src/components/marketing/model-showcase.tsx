import { getTopModels } from "@/lib/db/queries/models";
import { Container } from "@/components/layout/container";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ModelTag } from "@/components/shared/model-tag";

/**
 * Featured model cards on the landing page.
 *
 * Live data from the curated catalog (never mock): the eight most
 * affordable curated models, straight from the pricing engine.
 */
// One flagship per brand: the showcase is a story about coverage across
// frontier labs, not a price-sorted list.
const SHOWCASE_ORDER = [
  "claude-opus-5",
  "gpt-5.6-sol",
  "grok-4.5",
  "glm-5.2",
  "kimi-k3",
  "deepseek-v4-flash-0731",
];

export async function ModelShowcase() {
  // Opt this section into request-time rendering: the landing shell stays
  // static, but prices must never be baked at build time (the build
  // container has no database and would freeze the mock fallback in).
  const { connection } = await import("next/server");
  await connection();

  const all = await getTopModels(100);
  const bySlug = new Map(all.map((m) => [m.model, m]));
  const models = SHOWCASE_ORDER.map((slug) => bySlug.get(slug)).filter(
    (m): m is NonNullable<typeof m> => !!m,
  );

  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="wide">
        <h2 className="mb-3 text-center text-3xl font-semibold">
          All your favorite models, one key away
        </h2>
        <p className="mb-12 text-center text-text-secondary">
          Transparent per-1M-token pricing. No hidden fees, no credit expiry.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Link
              key={m.model}
              href={`/models/${m.model}`}
              className="group flex flex-col rounded-xl border border-border-default bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-card"
            >
              {/* Header: savings badge (upstream provider identity is masked) */}
              <div className="mb-4 flex items-center justify-between">
                <BrandLogo brand={m.provider} />
                <span className="font-mono text-xs font-medium text-success">
                  −{m.user_discount_pct.toFixed(0)}%
                </span>
              </div>

              {/* Model name + copyable API id */}
              <div className="mb-4">
                <ModelTag id={m.model} />
              </div>

              {/* Pricing block */}
              <div className="mt-auto space-y-2 border-t border-border-subtle pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">Input</span>
                  <span className="font-mono tabular text-text-primary">
                    {m.ref_input > m.user_input && (
                      <span className="mr-1 text-[11px] text-text-muted line-through">
                        ${formatPrice(m.ref_input)}
                      </span>
                    )}{" "}
                    ${formatPrice(m.user_input)}
                    <span className="text-text-muted">/1M</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">Output</span>
                  <span className="font-mono tabular text-text-primary">
                    {m.ref_output > m.user_output && (
                      <span className="mr-1 text-[11px] text-text-muted line-through">
                        ${formatPrice(m.ref_output)}
                      </span>
                    )}{" "}
                    ${formatPrice(m.user_output)}
                    <span className="text-text-muted">/1M</span>
                  </span>
                </div>
              </div>

              {/* Footer: context window */}
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-muted">
                <span>Context</span>
                <span className="font-mono">{m.context || "—"}</span>
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
            className="text-accent-text underline decoration-accent/40 underline-offset-2 hover:text-accent-hover"
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
