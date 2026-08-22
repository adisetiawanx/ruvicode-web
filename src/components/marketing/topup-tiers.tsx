import { Container } from "@/components/layout/container";
import { Infinity as InfinityIcon } from "lucide-react";

const TIERS = [5, 10, 25, 50, 100];

export function TopUpTiers() {
  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <h2 className="mb-3 text-center text-3xl font-semibold">
          Top up what you need
        </h2>
        <p className="mb-12 text-center text-text-secondary">
          Pay per request from a prepaid wallet. No subscription, top up
          from $0.01 in USDC.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TIERS.map((amount) => (
            <div
              key={amount}
              className="rounded-lg border border-border-default bg-surface p-6 text-center transition-colors hover:border-accent/30"
            >
              <p className="font-mono tabular text-2xl font-semibold">
                ${amount}
              </p>
              <p className="mt-1 text-xs text-text-muted">USD balance</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-secondary">
          <InfinityIcon className="h-4 w-4 text-success" />
          <span>
            <span className="font-medium text-text-primary">
              No credit expiry. Ever.
            </span>{" "}
            Your balance is yours.
          </span>
        </div>
      </Container>
    </section>
  );
}
