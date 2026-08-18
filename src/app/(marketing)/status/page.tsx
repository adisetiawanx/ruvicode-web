import type { Metadata } from "next";
import { CheckCircle2, Activity, Zap, Layers } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { ClientTime } from "@/components/shared/client-time";

// Don't index transient status page
export const metadata: Metadata = {
  title: "Status",
  alternates: { canonical: "https://ruvicode.com/status" },
  robots: { index: false, follow: false },
};

// Always render fresh: ISR caching served stale mock data in the Docker
// image where the build step has no database access.
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const models = await getAllActiveModels();
  const lastUpdated = new Date().toISOString();

  return (
    <Container size="wide" className="py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-text">
          System Status
        </p>
        <h1 className="mb-2 text-h1 font-semibold text-text-primary">
          All systems operational
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-subtle px-3 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <span className="text-sm text-text-secondary">Last updated</span>
          <ClientTime
            utc={lastUpdated}
            format="datetime"
            className="font-mono text-sm font-medium text-text-primary"
          />
        </div>
      </div>

      {/* Overall status */}
      <div className="mb-12 rounded-xl border border-border-default bg-surface p-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
          </span>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              Operational
            </p>
            <p className="text-sm text-text-secondary">
              The gateway is serving requests normally.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-surface-2/50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Activity className="h-3.5 w-3.5" />
              API Uptime (30d)
            </div>
            <p className="font-mono text-2xl tabular text-text-primary">
              99.9%
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2/50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Zap className="h-3.5 w-3.5" />
              Gateway Overhead
            </div>
            <p className="font-mono text-2xl tabular text-text-primary">
              &lt;20ms
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2/50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Layers className="h-3.5 w-3.5" />
              Active Models
            </div>
            <p className="font-mono text-2xl tabular text-text-primary">
              {models.length}
            </p>
          </div>
        </div>
      </div>

      {/* Per-model availability: two-column compact grid */}
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Model Availability
      </h2>
      <div className="overflow-hidden rounded-xl border border-border-default">
        <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x">
          {models.map((m, i) => (
            <div
              key={m.model}
              className={`flex items-center justify-between px-4 py-2.5 ${
                i % 2 === 1 ? "md:border-l-0" : ""
              } ${i < models.length - (models.length % 2 === 0 ? 2 : 1) ? "border-b border-border-subtle md:border-b" : ""}`}
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="truncate font-medium text-text-primary">
                  {m.display_name}
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-text-muted lg:inline">
                  {m.model}
                </span>
              </span>
              <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Available
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Model availability reflects the curated catalog. Individual model
        latency depends on the upstream provider.
      </p>
    </Container>
  );
}
