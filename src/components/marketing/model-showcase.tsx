import { Container } from "@/components/layout/container";
import { SHOWCASE_MODELS } from "@/lib/constants";

/**
 * Horizontal scroll strip of model cards.
 * MVP uses static SHOWCASE_MODELS; later ADRs fetch from model_prices table.
 */
export function ModelShowcase() {
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="wide">
        <h2 className="mb-12 text-center text-3xl font-semibold">
          All your favorite models, one key away
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {SHOWCASE_MODELS.map((m) => (
            <div
              key={m.model}
              className="w-64 flex-shrink-0 rounded-lg border border-border-default bg-surface p-5"
            >
              <p className="mb-1 font-semibold">{m.display_name}</p>
              <p className="text-sm text-text-secondary">
                From{" "}
                <span className="font-mono tabular">
                  ${m.user_input.toFixed(2)}
                </span>
                /1M tokens
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
