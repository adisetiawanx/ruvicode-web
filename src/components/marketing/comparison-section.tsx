import { Container } from "@/components/layout/container";
import { Check, X } from "lucide-react";

export function ComparisonSection() {
  const rows = [
    { feature: "Per-request cost visibility", ruvicode: true, openrouter: false },
    { feature: "Hard spend limits per key", ruvicode: true, openrouter: false },
    { feature: "Credit expiry", ruvicode: false, openrouter: true },
    { feature: "No hidden fees", ruvicode: true, openrouter: false },
    { feature: "USDC top-up option", ruvicode: true, openrouter: false },
    { feature: "Chinese models (GLM, Kimi, Qwen)", ruvicode: true, openrouter: true },
    { feature: "OpenAI-compatible endpoint", ruvicode: true, openrouter: true },
    { feature: "Streaming support", ruvicode: true, openrouter: true },
  ];

  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <h2 className="mb-3 text-center text-3xl font-semibold">
          Ruvicode vs OpenRouter
        </h2>
        <p className="mb-12 text-center text-text-secondary">
          Built from the ground up to fix OpenRouter&apos;s biggest problems.
        </p>
        <div className="overflow-hidden rounded-lg border border-border-default">
          <table className="w-full">
            <thead className="bg-surface border-b border-border-default">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-accent">
                  Ruvicode
                </th>
                <th className="px-6 py-4 text-center font-semibold text-text-secondary">
                  OpenRouter
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i % 2 === 0
                      ? "border-b border-border-subtle"
                      : "border-b border-border-subtle bg-surface/30"
                  }
                >
                  <td className="px-6 py-4 text-left text-text-secondary">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.ruvicode ? (
                      <Check className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-text-muted" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.openrouter ? (
                      <Check className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-text-muted" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
