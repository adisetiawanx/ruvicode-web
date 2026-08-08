import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PlaygroundChat } from "@/components/marketing/playground-chat";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "AI Playground — Try 20+ Models Free | Ruvicode",
  description:
    "Try Claude, GPT, Gemini, GLM, DeepSeek and more in your browser. No account needed. 5 free requests per hour. See real per-request costs.",
  alternates: { canonical: "https://ruvicode.com/playground" },
  openGraph: {
    title: "AI Playground | Ruvicode",
    description:
      "Try 20+ AI models in your browser. No account needed. 5 free requests per hour.",
    url: "https://ruvicode.com/playground",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Playground | Ruvicode",
    description: "Try 20+ AI models free. No account needed.",
  },
};

export default async function PlaygroundPage() {
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
        name: "Playground",
        item: "https://ruvicode.com/playground",
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
            <h1 className="mb-2 text-h1 font-semibold">AI Playground</h1>
            <p className="mb-8 text-text-secondary">
              Try any model. No account needed. 5 free requests per hour.
            </p>
          </PageEntranceItem>
          <PageEntranceItem>
            <PlaygroundChat models={models} />
          </PageEntranceItem>
        </PageEntrance>
      </Container>
    </>
  );
}
