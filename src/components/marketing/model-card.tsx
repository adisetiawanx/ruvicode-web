import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ModelWithPricing } from "@/lib/db/queries/models";

/** Format price — shows more decimals for very cheap models. */
function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(3);
  return price.toFixed(2);
}

export function ModelCard({ model }: { model: ModelWithPricing }) {
  return (
    <Link
      href={`/models/${model.model}`}
      className="group flex flex-col rounded-xl border border-border-default bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-card"
    >
      {/* Header: provider badge + savings */}
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs text-text-secondary">
          {model.provider}
        </Badge>
        <span className="font-mono text-xs font-medium text-success">
          −{model.user_discount_pct.toFixed(0)}%
        </span>
      </div>

      {/* Model name */}
      <h3 className="mb-4 text-lg font-semibold">{model.display_name}</h3>

      {/* Pricing block */}
      <div className="mt-auto space-y-2 border-t border-border-subtle pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-secondary">Input</span>
          <span className="font-mono tabular text-text-primary">
            ${formatPrice(model.user_input)}
            <span className="text-text-muted">/1M</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-secondary">Output</span>
          <span className="font-mono tabular text-text-primary">
            ${formatPrice(model.user_output)}
            <span className="text-text-muted">/1M</span>
          </span>
        </div>
      </div>

      {/* Footer: context window */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-muted">
        <span>Context</span>
        <span className="font-mono">{model.context}</span>
      </div>
      <p className="mt-3 text-xs text-accent transition-colors group-hover:text-accent-hover">
        View details →
      </p>
    </Link>
  );
}
