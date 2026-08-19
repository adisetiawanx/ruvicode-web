import type { Metadata } from "next";
import type { BreadcrumbList, ItemList, WithContext } from "schema-dts";
import { getAllActiveModels, getAllProviders, getPricingLastUpdated } from "@/lib/db/queries/models";
import { ModelCatalogGrid } from "@/components/marketing/model-catalog-grid";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { HowPricingWorks } from "@/components/marketing/how-pricing-works";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";
import { ClientTime } from "@/components/shared/client-time";

// Prices come from the live pricing engine; never prerender this at
// build time (the build container has no DB access and would bake in the
// static mock fallback).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Models - Catalog & Transparent Pricing",
  description:
    "Browse every AI model on Ruvicode with live transparent pricing. Filter by provider, price, and capabilities. Save up to 99% vs official provider pricing. No hidden fees.",
  alternates: { canonical: "https://ruvicode.com/models" },
  openGraph: {
    title: "AI Models - Catalog & Transparent Pricing",
    description:
      "Browse every AI model with live transparent pricing. Save up to 99% vs list price.",
    url: "https://ruvicode.com/models",
    siteName: "Ruvicode",
    type: "website",
    images: [
      {
        url: "https://ruvicode.com/og/ruvicode-default.png",
        width: 1200,
        height: 630,
        alt: "Ruvicode AI models catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Models - Catalog & Transparent Pricing",
    description: "Browse every AI model with live transparent pricing.",
    images: ["https://ruvicode.com/og/ruvicode-default.png"],
  },
};

export default async function ModelsPage() {
  const [models, providers, pricingLastUpdated] = await Promise.all([
    getAllActiveModels(),
    getAllProviders(),
    getPricingLastUpdated(),
  ]);

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

  const itemListJsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ruvicode AI Models",
    itemListElement: models.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.display_name,
      url: `https://ruvicode.com/models/${m.model}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="mb-2 flex flex-wrap items-center gap-3 text-3xl font-semibold">
                    Model catalog
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-subtle px-2.5 py-0.5 align-middle text-[11px] font-medium text-success">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                      </span>
                      Realtime pricing
                    </span>
                  </h2>
                  <p className="text-text-secondary">
                    Browse all {models.length} available models with live
                    pricing. Filter by provider, price, and sort to find the
                    right model for your use case.
                  </p>
                </div>
                {pricingLastUpdated && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-3 py-1">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span className="text-xs text-text-muted">Updated</span>
                    <ClientTime
                      utc={pricingLastUpdated}
                      format="datetime"
                      className="font-mono text-xs font-medium text-text-primary"
                    />
                  </div>
                )}
              </div>
              <ModelCatalogGrid models={models} providers={providers} />
            </Container>
          </section>
        </PageEntranceItem>
      </PageEntrance>
    </>
  );
}
