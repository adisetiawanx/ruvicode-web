import type { Metadata } from "next";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { HowPricingWorks } from "@/components/marketing/how-pricing-works";
import { PricingTable } from "@/components/marketing/pricing-table";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TopUpTiers } from "@/components/marketing/topup-tiers";
import { FaqSection } from "@/components/marketing/faq-section";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";
import { PRICING_FAQS } from "@/lib/pricing-faqs";
import {
  productJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  JsonLdScript,
} from "@/lib/seo/json-ld";

// Prices come from the live pricing engine; never prerender this at
// build time (the build container has no DB access and would bake in the
// static mock fallback).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — Transparent Per-Request AI API Costs",
  description:
    "See exact per-request pricing for 20+ AI models. Transparent $/1M token rates. Save up to 77% vs OpenRouter. No hidden fees, no credit expiry.",
  alternates: { canonical: "https://ruvicode.com/pricing" },
  openGraph: {
    title: "Transparent Per-Request AI API Costs",
    description:
      "See exact per-request pricing for 20+ AI models. Save up to 77% vs OpenRouter.",
    url: "https://ruvicode.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Transparent AI API Costs",
    description:
      "See exact per-request pricing for 20+ AI models. Save up to 77% vs OpenRouter.",
  },
};

export default async function PricingPage() {
  const models = await getAllActiveModels();

  return (
    <>
      <JsonLdScript
        data={productJsonLd({
          name: "Ruvicode AI API Access",
          description:
            "Unified API access to 20+ AI models with transparent per-request pricing.",
          price: "0.00",
        })}
      />
      <JsonLdScript
        data={faqJsonLd(PRICING_FAQS as unknown as Array<{ q: string; a: string }>)}
      />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: "" },
          { name: "Pricing", url: "/pricing" },
        ])}
      />
      <PageEntrance>
        <PageEntranceItem>
          <PricingHero />
        </PageEntranceItem>
        <PageEntranceItem>
          <HowPricingWorks />
        </PageEntranceItem>
        <PageEntranceItem>
          <section className="border-b border-border-subtle py-20">
            <Container size="wide">
              <h2 className="mb-12 text-center text-3xl font-semibold">
                Model pricing
              </h2>
              <PricingTable models={models} />
            </Container>
          </section>
        </PageEntranceItem>
        <PageEntranceItem>
          <ComparisonSection />
        </PageEntranceItem>
        <PageEntranceItem>
          <TopUpTiers />
        </PageEntranceItem>
        <PageEntranceItem>
          <FaqSection faqs={PRICING_FAQS} />
        </PageEntranceItem>
      </PageEntrance>
    </>
  );
}
