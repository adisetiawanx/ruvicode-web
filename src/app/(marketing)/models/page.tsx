import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels, getAllProviders } from "@/lib/db/queries/models";
import { ModelCatalogGrid } from "@/components/marketing/model-catalog-grid";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { HowPricingWorks } from "@/components/marketing/how-pricing-works";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

// Prices come from the live pricing engine; never prerender this at
// build time (the build container has no DB access and would bake in the
// static mock fallback).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Models — Catalog & Transparent Pricing",
  description:
    "Browse every AI model on Ruvicode with live transparent pricing. Filter by provider, price, and capabilities. Save up to 77% vs OpenRouter. No hidden fees.",
  alternates: { canonical: "https://ruvicode.com/models" },
  openGraph: {
    title: "AI Models — Catalog & Transparent Pricing",
    description:
      "Browse every AI model with live transparent pricing. Save up to 77% vs OpenRouter.",
    url: "https://ruvicode.com/models",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Models — Catalog & Transparent Pricing",
    description: "Browse every AI model with live transparent pricing.",
  },
};

export default async function ModelsPage() {
  const models = await getAllActiveModels();
  const providers = await getAllProviders();

  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ruvicode.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Models",
        item: "https://ruvicode.com/models",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageEntrance>
        {/* Pricing intro (merged from the old /pricing page) */}
        <PageEntranceItem>
          <PricingHero />
        </PageEntranceItem>
        <PageEntranceItem>
          <HowPricingWorks />
        </PageEntranceItem>

        {/* Full catalog with filters */}
        <PageEntranceItem>
          <section id="model-catalog" className="scroll-mt-20 py-12">
            <Container size="wide">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-semibold">Model catalog</h2>
                <p className="text-text-secondary">
                  Browse all {models.length} available models with live
                  pricing. Filter by provider, price, and sort to find the
                  right model for your use case.
                </p>
              </div>
              <ModelCatalogGrid models={models} providers={providers} />
            </Container>
          </section>
        </PageEntranceItem>

        {/* Full sortable price table */}
        <PageEntranceItem>
          <section className="border-t border-border-subtle py-16">
            <Container size="wide">
              <h2 className="mb-2 text-3xl font-semibold">
                Compare all models
              </h2>
              <p className="mb-8 text-text-secondary">
                Sortable price list for every model, refreshed every 2 minutes
                from the live market.
              </p>
              <PricingTable models={models} />
            </Container>
          </section>
        </PageEntranceItem>
      </PageEntrance>
    </>
  );
}
