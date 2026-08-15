import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product, BreadcrumbList, WithContext } from "schema-dts";
import { getModelBySlug } from "@/lib/db/queries/models";
import { highlightCode } from "@/lib/shiki";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ModelTag } from "@/components/shared/model-tag";
import { LinkButton } from "@/components/shared/link-button";
import {
  CodeDemo,
  type CodeTab,
} from "@/components/marketing/code-demo";
import { ArrowLeft, ArrowRight, Sparkles, TrendingDown } from "lucide-react";

export const revalidate = 300; // on-demand ISR — never prerendered at build

/** SECURITY: validate slug format — only allow lowercase alphanumeric,
 * hyphens, dots, and colons (variant slugs like "kimi-k2.5:web" use them).
 * Prevents path traversal. */
const SLUG_REGEX = /^[a-z0-9.:-]+$/;

// No generateStaticParams: the build container cannot reach the database,
// so build-time params would come from the static mock fallback and bake
// mock prices into the prerendered pages. Pages are instead rendered on
// demand and cached by ISR below.

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
    title: `${model.display_name} API — Pricing & Docs`,
    description: `${model.display_name} via Ruvicode. Input $${model.user_input.toFixed(2)}/1M, output $${model.user_output.toFixed(2)}/1M tokens. Save ${model.user_discount_pct.toFixed(0)}% vs OpenRouter. OpenAI-compatible endpoint.`,
    alternates: { canonical: `https://ruvicode.com/models/${model.model}` },
    openGraph: {
      title: `${model.display_name} API`,
      description: `Save ${model.user_discount_pct.toFixed(0)}% vs OpenRouter on ${model.display_name}.`,
      url: `https://ruvicode.com/models/${model.model}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${model.display_name} API`,
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

  // Quickstart snippets are static per model, so they are highlighted with
  // Shiki on the server and shipped as HTML (zero client JS for coloring).
  const samples = [
    {
      label: "curl",
      lang: "bash" as const,
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
      lang: "python" as const,
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
      lang: "typescript" as const,
      code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "rvcd_...",
  baseURL: "https://api.ruvicode.com/v1",
});

const response = await client.chat.completions.create({
  model: "${model.model}",
  messages: [{ role: "user", content: "Hello" }],
});

console.log(response.choices[0].message.content);`,
    },
  ];

  const quickstartTabs: CodeTab[] = await Promise.all(
    samples.map(async (s) => ({
      label: s.label,
      highlightedHtml: await highlightCode(s.code, s.lang),
      rawCode: s.code,
    })),
  );

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
      <Container size="wide" className="py-10 md:py-14">
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
        <div className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <BrandLogo brand={model.provider} className="h-8 w-8" />
                <h1 className="text-h1 font-bold tracking-tight">
                  {model.display_name}
                </h1>
                <span className="rounded-full border border-success/30 bg-success-subtle px-3 py-1 font-mono text-xs font-medium tabular text-success">
                  −{model.user_discount_pct.toFixed(0)}% vs OpenRouter
                </span>
              </div>
              <div className="mb-1">
                <ModelTag id={model.model} showName={false} />
              </div>
              {model.capabilities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {model.capabilities.map((cap) => (
                    <Badge
                      key={cap}
                      variant="secondary"
                      className="capitalize"
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <LinkButton
              href={`/playground?model=${model.model}`}
              variant="primary"
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Try in Playground
            </LinkButton>
          </div>

          {/* Price strip */}
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-default bg-border-subtle sm:grid-cols-3">
            <div className="bg-surface p-5">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                Input
              </p>
              <p className="font-mono text-2xl font-semibold tabular text-text-primary">
                ${formatPrice(model.user_input)}
                <span className="ml-1 text-sm font-normal text-text-muted">
                  /1M tokens
                </span>
              </p>
            </div>
            <div className="bg-surface p-5">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                Output
              </p>
              <p className="font-mono text-2xl font-semibold tabular text-text-primary">
                ${formatPrice(model.user_output)}
                <span className="ml-1 text-sm font-normal text-text-muted">
                  /1M tokens
                </span>
              </p>
            </div>
            <div className="bg-surface p-5">
              <p className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                <TrendingDown className="h-3.5 w-3.5" />
                You save
              </p>
              <p className="font-mono text-2xl font-semibold tabular text-success">
                {model.user_discount_pct.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: Quickstart */}
          <div>
            <h2 className="mb-1 text-xl font-semibold">Quickstart</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Use the OpenAI SDK with your Ruvicode API key. Just change the
              base URL and model name.
            </p>
            <CodeDemo tabs={quickstartTabs} />

            <div className="mt-8 flex items-center justify-between rounded-xl border border-border-default bg-surface p-5">
              <div>
                <p className="font-medium text-text-primary">
                  Need the full API reference?
                </p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Authentication, streaming, error handling, and rate limits.
                </p>
              </div>
              <Link
                href="/docs"
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent-text transition-colors hover:text-accent-hover"
              >
                Read the docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: reference card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border-default bg-surface p-6">
              <h3 className="mb-4 font-semibold">Reference pricing</h3>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    OpenRouter input
                  </span>
                  <span className="font-mono text-sm tabular text-text-muted">
                    ${formatPrice(model.ref_input)}/1M
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    OpenRouter output
                  </span>
                  <span className="font-mono text-sm tabular text-text-muted">
                    ${formatPrice(model.ref_output)}/1M
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border-subtle pt-3">
                  <span className="text-sm text-text-secondary">
                    Ruvicode price
                  </span>
                  <span className="font-mono text-sm font-medium tabular text-success">
                    −{model.user_discount_pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-text-muted">
                Live market pricing, refreshed every 2 minutes. No minimum
                spend, no credit expiry.
              </p>
            </div>

            {model.context && (
              <div className="rounded-xl border border-border-default bg-surface p-6">
                <h3 className="mb-4 font-semibold">Specs</h3>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">
                    Context window
                  </span>
                  <span className="font-mono text-sm tabular text-text-primary">
                    {model.context}
                  </span>
                </div>
              </div>
            )}

            <LinkButton href="/register" variant="primary" className="w-full">
              Get Started
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </LinkButton>

            <Link
              href="/models"
              className="flex items-center justify-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              All models
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
