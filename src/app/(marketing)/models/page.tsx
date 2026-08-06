import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels, getAllProviders } from "@/lib/db/queries/models";
import { ModelCatalogGrid } from "@/components/marketing/model-catalog-grid";
import { Container } from "@/components/layout/container";

export const revalidate = 300; // SSR — 5 minute revalidation

export const metadata: Metadata = {
  title: "AI Model Catalog — Browse 20+ Models | Ruvicode",
  description:
    "Browse all AI models available on Ruvicode. Filter by provider, price, and capabilities. Claude, GPT, Gemini, GLM, DeepSeek, Kimi, Qwen and more.",
  alternates: { canonical: "https://ruvicode.com/models" },
  openGraph: {
    title: "AI Model Catalog | Ruvicode",
    description:
      "Browse all AI models available on Ruvicode. Claude, GPT, Gemini, GLM, DeepSeek and more.",
    url: "https://ruvicode.com/models",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Model Catalog | Ruvicode",
    description:
      "Browse all AI models available on Ruvicode. Filter by provider and price.",
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
      <Container className="py-12">
        <h1 className="mb-2 text-h1 font-semibold">Model Catalog</h1>
        <p className="mb-8 text-text-secondary">
          Browse all {models.length} available models. Filter by provider, price,
          and sort to find the right model for your use case.
        </p>
        <ModelCatalogGrid models={models} providers={providers} />
      </Container>
    </>
  );
}
