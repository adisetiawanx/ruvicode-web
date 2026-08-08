import type { Metadata } from "next";
import Link from "next/link";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models & Pricing",
  robots: { index: false, follow: false },
};

export default async function DashboardModelsPage() {
  const models = await getAllActiveModels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Models &amp; Pricing
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live pricing for all available models. Filter, sort, and compare.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/pricing" />}
        >
          Public pricing page →
        </Button>
      </div>

      <PricingTable models={models} />
    </div>
  );
}
