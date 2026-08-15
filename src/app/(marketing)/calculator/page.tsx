import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

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
        <PageEntrance>
          <PageEntranceItem>
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-text">
                Cost Calculator
              </p>
              <h1 className="mb-3 text-h1 font-semibold text-text-primary">
                See exactly how much you save
              </h1>
              <p className="text-text-secondary">
                Pick a model, enter your monthly token usage, and compare what
                you pay with Ruvicode versus the official provider price. The
                savings are real, not a teaser rate.
              </p>
            </div>
          </PageEntranceItem>

          <PageEntranceItem>
            <CostCalculator models={models} />
          </PageEntranceItem>
        </PageEntrance>
      </Container>
    </>
  );
}
