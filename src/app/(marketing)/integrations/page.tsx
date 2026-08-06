import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { Container } from "@/components/layout/container";
import { CodeDemo, type CodeTab } from "@/components/marketing/code-demo";
import { CODE_SAMPLES } from "@/lib/code-samples";
import { highlightCode } from "@/lib/shiki";

export const metadata: Metadata = {
  title: "Integrations — Works with your tools",
  description:
    "Ruvicode works with Cursor, Aider, Claude Code, LangChain, and any OpenAI-compatible tool. One base URL change.",
  alternates: { canonical: "https://ruvicode.com/integrations" },
};

const integrations = [
  {
    name: "Cursor",
    description: "Point Cursor at Ruvicode with one base URL change.",
    config: `OPENAI_API_KEY=rvcd_...
OPENAI_BASE_URL=https://api.ruvicode.com/v1`,
    setup: "Settings → Models → OpenAI API Base → paste URL",
  },
  {
    name: "Aider",
    description: "Use Ruvicode with Aider AI coding assistant.",
    config: `export OPENAI_API_BASE=https://api.ruvicode.com/v1
export OPENAI_API_KEY=rvcd_...`,
    setup: "Set environment variables, run aider",
  },
  {
    name: "Claude Code",
    description: "Route Claude Code through Ruvicode on any model.",
    config: `ANTHROPIC_BASE_URL=https://api.ruvicode.com/anthropic
ANTHROPIC_API_KEY=rvcd_...`,
    setup: "Set environment variables before launching Claude Code",
  },
  {
    name: "LangChain",
    description: "Use Ruvicode as your LangChain LLM provider.",
    config: `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="glm-5.2",
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1"
)`,
    setup: "Point ChatOpenAI at Ruvicode base URL",
  },
  {
    name: "OpenCode / Continue",
    description: "Any OpenAI-compatible tool works out of the box.",
    config: `base_url: https://api.ruvicode.com/v1
api_key: rvcd_...`,
    setup: "Change base URL in your tool's config",
  },
];

export default async function IntegrationsPage() {
  // Pre-highlight code samples with Shiki (server-side)
  const codeTabs: CodeTab[] = await Promise.all(
    CODE_SAMPLES.map(async (sample) => ({
      label: sample.label,
      highlightedHtml: await highlightCode(sample.code, sample.lang as never),
      rawCode: sample.code,
    })),
  );

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
        name: "Integrations",
        item: "https://ruvicode.com/integrations",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container size="content" className="py-24">
        <h1 className="mb-4 text-4xl font-bold">
          Works with your favorite tools
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-text-secondary">
          Ruvicode is OpenAI-compatible. Point any tool at our base URL and
          you&apos;re ready — no SDK changes, no vendor lock-in.
        </p>

        <div className="space-y-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="rounded-lg border border-border-default bg-surface p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-1 text-xl font-semibold">
                    {integration.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {integration.description}
                  </p>
                </div>
              </div>
              <details className="group">
                <summary className="cursor-pointer text-sm text-accent-text hover:underline">
                  Show setup
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">
                      Config
                    </p>
                    <pre className="overflow-x-auto rounded-md border border-border-default bg-inset p-4 font-mono text-xs text-text-primary">
                      <code>{integration.config}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-text-secondary">
                    <span className="text-text-muted">Setup: </span>
                    {integration.setup}
                  </p>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">Try it now</h2>
          <CodeDemo tabs={codeTabs} />
        </div>
      </Container>
    </>
  );
}
