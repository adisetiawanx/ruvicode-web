import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product, BreadcrumbList, WithContext } from "schema-dts";
import { getAllActiveModels, getModelBySlug } from "@/lib/db/queries/models";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { QuickstartCode } from "@/components/shared/quickstart-code";

export const revalidate = 300; // SSR — 5 minute revalidation

/** SECURITY: validate slug format — only allow lowercase alphanumeric,
 * hyphens, dots, and colons (variant slugs like "kimi-k2.5:web" use them).
 * Prevents path traversal. */
const SLUG_REGEX = /^[a-z0-9.:-]+$/;

/** Slugs that are safe to prerender as static files on every OS.
 * Windows forbids ':' in directory names, so variant slugs are excluded
 * here and rendered on demand instead (dynamicParams is on by default). */
const STATIC_SLUG_REGEX = /^[a-z0-9.-]+$/;

/** Pre-generate model detail pages at build time. */
export function generateStaticParams() {
  return getAllActiveModels().then((models) =>
    models
      .filter((m) => STATIC_SLUG_REGEX.test(m.model))
      .map((m) => ({ model: m.model })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: slug } = await params;
  if (!SLUG_REGEX.test(slug)) return {};
  const model = await getModelBySlug(slug);
  if (!model) return {};

  return {
    title: `${model.display_name} API — Pricing & Docs | Ruvicode`,
    description: `${model.display_name} via Ruvicode. Input $${model.user_input.toFixed(2)}/1M, output $${model.user_output.toFixed(2)}/1M tokens. Save ${model.user_discount_pct.toFixed(0)}% vs OpenRouter. OpenAI-compatible endpoint.`,
    alternates: { canonical: `https://ruvicode.com/models/${model.model}` },
    openGraph: {
      title: `${model.display_name} API | Ruvicode`,
      description: `Save ${model.user_discount_pct.toFixed(0)}% vs OpenRouter on ${model.display_name}.`,
      url: `https://ruvicode.com/models/${model.model}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${model.display_name} API | Ruvicode`,
      description: `Save ${model.user_discount_pct.toFixed(0)}% vs OpenRouter on ${model.display_name}.`,
    },
  };
}

function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: slug } = await params;
  if (!SLUG_REGEX.test(slug)) notFound();
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const quickstartTabs = [
    {
      label: "curl",
      code: `curl https://api.ruvicode.com/v1/chat/completions \\
  -H "Authorization: Bearer rvcd_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.model}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`,
    },
    {
      label: "python",
      code: `from openai import OpenAI

client = OpenAI(
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1"
)

response = client.chat.completions.create(
    model="${model.model}",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
    },
    {
      label: "node",
      code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "rvcd_...",
  baseURL: "https://api.ruvicode.com/v1",
});

const response = await client.chat.completions.create({
  model: "${model.model}",
  messages: [{ role: "user", content: "Hello" }],
});`,
    },
  ];

  const productJsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${model.display_name} API Access`,
    description: `${model.display_name} via Ruvicode with an OpenAI-compatible endpoint.`,
    brand: { "@type": "Brand", name: "Ruvicode" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: model.user_input.toFixed(4),
      description: `$${model.user_input.toFixed(2)}/1M input tokens, $${model.user_output.toFixed(2)}/1M output tokens`,
    },
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
        name: "Models",
        item: "https://ruvicode.com/models",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.display_name,
        item: `https://ruvicode.com/models/${model.model}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container size="content" className="py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-secondary">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/models"
            className="transition-colors hover:text-text-secondary"
          >
            Models
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{model.display_name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-h1 font-bold">{model.display_name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="capitalize">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
          <LinkButton
            href={`/playground?model=${model.model}`}
            variant="outline"
            size="sm"
          >
            Try in Playground →
          </LinkButton>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: Quickstart */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Quickstart</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Use the OpenAI SDK with your Ruvicode API key. Just change the base
              URL and model name.
            </p>
            <QuickstartCode tabs={quickstartTabs} />
          </div>

          {/* Right: Pricing card */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border-default bg-surface p-6">
              <h3 className="mb-4 font-semibold">Pricing</h3>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    Input / 1M tokens
                  </span>
                  <span className="font-mono tabular text-lg text-text-primary">
                    ${formatPrice(model.user_input)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    Output / 1M tokens
                  </span>
                  <span className="font-mono tabular text-lg text-text-primary">
                    ${formatPrice(model.user_output)}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-border-subtle pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    vs OpenRouter
                  </span>
                  <span className="font-mono tabular font-medium text-success">
                    −{model.user_discount_pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border-default bg-surface p-6">
              <h3 className="mb-4 font-semibold">Specs</h3>
              <div className="space-y-3">
              {model.context && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    Context window
                  </span>
                  <span className="font-mono tabular text-text-primary">
                    {model.context}
                  </span>
                </div>
              )}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    OpenRouter ref
                  </span>
                  <span className="font-mono text-text-muted">
                    ${formatPrice(model.ref_input)} / $
                    {formatPrice(model.ref_output)}
                  </span>
                </div>
              </div>
            </div>

            <LinkButton href="/register" variant="primary" className="w-full">
              Get Started →
            </LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
