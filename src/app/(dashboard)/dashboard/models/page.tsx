import type { Metadata } from "next";
import Link from "next/link";
import { getAllActiveModels, getPricingLastUpdated } from "@/lib/db/queries/models";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models & Pricing",
  robots: { index: false, follow: false },
};

export default async function DashboardModelsPage() {
  const [models, pricingLastUpdated] = await Promise.all([
    getAllActiveModels(),
    getPricingLastUpdated(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-text-primary">
            Models &amp; Pricing
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-subtle px-2.5 py-0.5 align-middle text-[11px] font-medium text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Realtime
            </span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live pricing for all available models. Filter, sort, and compare.
            {pricingLastUpdated && (
              <>
                {" "}
                Last updated{" "}
                <time
                  className="font-mono"
                  dateTime={pricingLastUpdated.toISOString()}
                >
                  {pricingLastUpdated.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/models" />}
        >
          Public pricing page →
        </Button>
      </div>

      <PricingTable models={models} />
    </div>
  );
}
