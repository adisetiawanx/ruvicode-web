import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PlaygroundChat } from "@/components/marketing/playground-chat";
import { publicPlaygroundFallbackModel, displayModelName } from "@/lib/playground";
import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/shared/link-button";
import { Lock } from "lucide-react";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "AI Playground - Try a Model Free",
  description:
    "Try AI models free in your browser. No account, no API key, no setup. Send a real request right now and see live token pricing per request.",
  alternates: { canonical: "https://ruvicode.com/playground" },
  openGraph: {
    title: "AI Playground",
    description: "Try AI models free in your browser. No account needed. Fair-use limits apply.",
    url: "https://ruvicode.com/playground",
    siteName: "Ruvicode",
    type: "website",
    images: [
      {
        url: "https://ruvicode.com/og/ruvicode-default.png",
        width: 1200,
        height: 630,
        alt: "Ruvicode AI playground",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Playground",
    description: "Try AI models free. No account needed.",
    images: ["https://ruvicode.com/og/ruvicode-default.png"],
  },
};

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const models = await getAllActiveModels();
  const params = await searchParams;
  const requested =
    typeof params.model === "string" ? params.model : undefined;
  const isFree = !requested || requested === publicPlaygroundFallbackModel;
  const lockedModel = models.find((m) => m.model === requested);

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
            <h1 className="mb-2 text-h1 font-semibold">Try it free</h1>
            <p className="mb-8 text-text-secondary">
              Send a real request to a free AI model right now. No account,
              no key, no setup. Fair-use limits apply.
            </p>
          </PageEntranceItem>
          <PageEntranceItem>
            {!isFree && lockedModel ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-border-default bg-surface p-8 text-center">
                  <Lock className="mb-4 h-10 w-10 text-accent" />
                  <h2 className="mb-2 text-xl font-semibold">
                    {lockedModel.display_name} is a paid model
                  </h2>
                  <p className="mb-6 max-w-md text-sm text-text-secondary">
                    The free playground runs on{" "}
                    {models.find((m) => m.model === publicPlaygroundFallbackModel)
                      ?.display_name ?? displayModelName(publicPlaygroundFallbackModel)}
                    . Create a free account to try more models in the
                    catalog with your own API key and real per-request pricing.
                  </p>
                </div>
              </div>
            ) : (
              <PlaygroundChat
                models={models}
                endpoint="/api/playground/chat"
                lockModel={publicPlaygroundFallbackModel}
                showFreeBadges
              />
            )}
          </PageEntranceItem>
        </PageEntrance>
      </Container>
    </>
  );
}
