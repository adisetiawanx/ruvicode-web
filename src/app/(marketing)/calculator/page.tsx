import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "AI API Cost Calculator - See Your Savings",
  description:
    "Calculate exactly how much you'll save with Ruvicode vs official provider pricing. Compare per-token costs across 30+ AI models.",
  alternates: { canonical: "https://ruvicode.com/calculator" },
  openGraph: {
    title: "AI API Cost Calculator",
    description:
      "Calculate your savings with Ruvicode vs official provider pricing.",
    url: "https://ruvicode.com/calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI API Cost Calculator",
    description: "See how much you'll save with Ruvicode.",
  },
};

export default async function CalculatorPage() {
  const models = await getAllActiveModels();

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
        name: "Calculator",
        item: "https://ruvicode.com/calculator",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container size="wide" className="py-12">
        <h1 className="mb-2 text-h1 font-semibold">Cost Calculator</h1>
        <p className="mb-8 text-text-secondary">
          See exactly how much you&apos;ll save with Ruvicode versus official
          provider pricing.
        </p>
        <CostCalculator models={models} />
      </Container>
    </>
  );
}
