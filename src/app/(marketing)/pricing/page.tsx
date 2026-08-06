import type { Metadata } from "next";
import type { FAQPage, Product, BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { HowPricingWorks } from "@/components/marketing/how-pricing-works";
import { PricingTable } from "@/components/marketing/pricing-table";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { TopUpTiers } from "@/components/marketing/topup-tiers";
import { FaqSection } from "@/components/marketing/faq-section";
import { Container } from "@/components/layout/container";
import { PRICING_FAQS } from "@/lib/pricing-faqs";

export const revalidate = 300; // SSR — 5 minute revalidation

export const metadata: Metadata = {
  title: "Pricing — Transparent Per-Request AI API Costs | Ruvicode",
  description:
    "See exact per-request pricing for 20+ AI models. Transparent $/1M token rates. Save up to 77% vs OpenRouter. No hidden fees, no credit expiry.",
  alternates: { canonical: "https://ruvicode.com/pricing" },
  openGraph: {
    title: "Transparent Per-Request AI API Costs | Ruvicode",
    description:
      "See exact per-request pricing for 20+ AI models. Save up to 77% vs OpenRouter.",
    url: "https://ruvicode.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Transparent AI API Costs | Ruvicode",
    description:
      "See exact per-request pricing for 20+ AI models. Save up to 77% vs OpenRouter.",
  },
};

export default async function PricingPage() {
  const models = await getAllActiveModels();

  const productJsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Ruvicode AI API Access",
    description:
      "Unified API access to 20+ AI models with transparent per-request pricing.",
    brand: { "@type": "Brand", name: "Ruvicode" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0.00",
      description: "Pay-per-request. Top up starting at $5.",
    },
  };

  const faqJsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

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
        name: "Pricing",
        item: "https://ruvicode.com/pricing",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PricingHero />
      <HowPricingWorks />
      <section className="border-b border-border-subtle py-20">
        <Container size="wide">
          <h2 className="mb-12 text-center text-3xl font-semibold">
            Model pricing
          </h2>
          <PricingTable models={models} />
        </Container>
      </section>
      <ComparisonSection />
      <TopUpTiers />
      <FaqSection faqs={PRICING_FAQS} />
    </>
  );
}
