import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels, getAllProviders, getPricingLastUpdated } from "@/lib/db/queries/models";
import { ModelCatalogGrid } from "@/components/marketing/model-catalog-grid";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { HowPricingWorks } from "@/components/marketing/how-pricing-works";
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
  title: "AI Models - Catalog & Transparent Pricing",
  description:
    "Browse every AI model on Ruvicode with live transparent pricing. Filter by provider, price, and capabilities. Save up to 99% vs list price. No hidden fees.",
  alternates: { canonical: "https://ruvicode.com/models" },
  openGraph: {
    title: "AI Models - Catalog & Transparent Pricing",
    description:
      "Browse every AI model with live transparent pricing. Save up to 99% vs list price.",
    url: "https://ruvicode.com/models",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Models - Catalog & Transparent Pricing",
    description: "Browse every AI model with live transparent pricing.",
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
                  <p className="text-xs text-text-muted">
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
                  </p>
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
