import { Container } from "@/components/layout/container";
import { Check, X } from "lucide-react";

export function ComparisonSection() {
  const rows = [
    { feature: "Per-request cost visibility", ruvicode: true, official: false, gateways: false },
    { feature: "Hard spend limits per key", ruvicode: true, official: false, gateways: false },
    { feature: "Credit expiry", ruvicode: false, official: null, gateways: true },
    { feature: "Hidden fees", ruvicode: false, official: false, gateways: true },
    { feature: "USDC top-up", ruvicode: true, official: false, gateways: false },
    { feature: "One key, all providers", ruvicode: true, official: false, gateways: true },
    { feature: "OpenAI-compatible", ruvicode: true, official: true, gateways: true },
    { feature: "Streaming", ruvicode: true, official: true, gateways: true },
    { feature: "Real-time market pricing", ruvicode: true, official: false, gateways: false },
  ];

  return (
    <section className="border-b border-border-subtle py-20">
      <Container size="content">
        <h2 className="mb-3 text-center text-3xl font-semibold">
          How Ruvicode compares
        </h2>
        <p className="mb-12 text-center text-text-secondary">
          What you get with Ruvicode versus going direct to official APIs or
          using another gateway.
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
                  Official APIs
                </th>
                <th className="px-6 py-4 text-center font-semibold text-text-secondary">
                  Other gateways
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
                    {row.official === null ? (
                      <span className="text-xs text-text-muted">N/A</span>
                    ) : row.official ? (
                      <Check className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-text-muted" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.gateways ? (
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
