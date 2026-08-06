import { Container } from "@/components/layout/container";
import { DollarSign, Percent, TrendingDown, Wallet } from "lucide-react";

export function HowPricingWorks() {
  const steps = [
    {
      icon: DollarSign,
      label: "Reference Price",
      description: "OpenRouter's listed price — the industry reference rate.",
    },
    {
      icon: Percent,
      label: "Our Discount",
      description:
        "We source capacity at 35–99% discount through a competitive marketplace.",
    },
    {
      icon: Wallet,
      label: "Your Price",
      description:
        "We pass most of the discount to you, keeping a small margin to keep the lights on.",
    },
    {
      icon: TrendingDown,
      label: "Your Savings",
      description:
        "You pay 20–77% less than OpenRouter, with full per-request cost transparency.",
    },
  ];

  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <h2 className="mb-12 text-center text-3xl font-semibold">
          How pricing works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="relative rounded-lg border border-border-default bg-surface p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                <step.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">
                  0{i + 1}
                </span>
                <h3 className="font-semibold">{step.label}</h3>
              </div>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
