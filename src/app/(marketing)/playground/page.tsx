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
  title: "AI Playground - Try DeepSeek V4 Flash Free",
  description:
    "Try DeepSeek V4 Flash in your browser. Free, no account needed, fair-use limits apply. Sign up for every model with real per-request pricing.",
  alternates: { canonical: "https://ruvicode.com/playground" },
  openGraph: {
    title: "AI Playground",
    description: "Try DeepSeek V4 Flash in your browser. Free, fair-use limits apply.",
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
    description: "Try DeepSeek V4 Flash free. No account needed.",
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
            <h1 className="mb-2 text-h1 font-semibold">AI Playground</h1>
            <p className="mb-8 text-text-secondary">
              Try a model in your browser. Free, no account needed, fair-use
              limits apply.
            </p>
          </PageEntranceItem>
          <PageEntranceItem>
            {!isFree && lockedModel ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-border-default bg-surface p-8 text-center">
                  <Lock className="mb-4 h-10 w-10 text-accent" />
                  <h2 className="mb-2 text-xl font-semibold">
                    {lockedModel.display_name} needs an account
                  </h2>
                  <p className="mb-6 max-w-md text-sm text-text-secondary">
                    The free playground only includes{" "}
                    {models.find((m) => m.model === publicPlaygroundFallbackModel)
                      ?.display_name ?? displayModelName(publicPlaygroundFallbackModel)}
                    . Create a free account to try every model in the dashboard
                    playground with your own API key.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <LinkButton href="/register" variant="primary">
                      Sign up free →
                    </LinkButton>
                    <LinkButton
                      href="/playground"
                      variant="outline"
                    >
                      Try the free model
                    </LinkButton>
                  </div>
                </div>
                <div className="space-y-4 rounded-lg border border-border-default bg-surface p-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-text-secondary">
                      {lockedModel.display_name} pricing
                    </p>
                    <div className="space-y-2 font-mono text-xs tabular text-text-secondary">
                      <p>
                        ${lockedModel.user_input.toFixed(4)}/1M input tokens
                      </p>
                      <p>
                        ${lockedModel.user_output.toFixed(4)}/1M output tokens
                      </p>
                      <p className="text-success">
                        Save {lockedModel.user_discount_pct.toFixed(0)}% vs
                        OpenRouter
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border-subtle pt-3">
                    <p className="text-xs text-text-muted">
                      Free playground model, no account needed.
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
                      <Lock className="h-3 w-3" />
                      Chats are not saved or stored.
                    </p>
                  </div>
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
