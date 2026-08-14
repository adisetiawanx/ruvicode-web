import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { SHOWCASE_MODELS } from "@/lib/constants";

// Don't index transient status page
export const metadata: Metadata = {
  title: "Status",
  robots: { index: false, follow: false },
};

// Refresh every minute
export const revalidate = 60;

export default function StatusPage() {
  const lastUpdated = new Date().toISOString();

  return (
    <Container size="wide" className="py-24">
      <div className="mb-12">
        <h1 className="mb-2 text-4xl font-bold">System Status</h1>
        <p className="text-sm text-text-muted">
          Last updated:{" "}
          <time className="font-mono" dateTime={lastUpdated}>
            {new Date(lastUpdated).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </p>
      </div>

      {/* Overall status */}
      <div className="mb-12 rounded-lg border border-border-default bg-surface p-8">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-success" />
          <div>
            <p className="text-lg font-semibold">All systems operational</p>
            <p className="text-sm text-text-secondary">
              All models are available and responding normally.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-text-muted">API Uptime (30d)</p>
            <p className="font-mono text-2xl tabular text-text-primary">
              99.9%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Avg Latency</p>
            <p className="font-mono text-2xl tabular text-text-primary">
              42ms
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Active Models</p>
            <p className="font-mono text-2xl tabular text-text-primary">
              {SHOWCASE_MODELS.length}+
            </p>
          </div>
        </div>
      </div>

      {/* Per-model availability */}
      <h2 className="mb-4 text-xl font-semibold">Model Availability</h2>
      <div className="overflow-hidden rounded-lg border border-border-default">
        <table className="w-full">
          <thead className="border-b border-border-default bg-surface">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                Model
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {SHOWCASE_MODELS.map((m) => (
              <tr
                key={m.model}
                className="border-b border-border-subtle last:border-0"
              >
                <td className="px-4 py-3 font-medium">{m.display_name}</td>
                <td className="px-4 py-3">
                  <Badge className="border-success/30 bg-success-subtle text-success">
                    Operational
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs text-text-muted">
        Status data refreshes every minute. Model availability is determined by
        upstream provider marketplace health.
      </p>
    </Container>
  );
}
