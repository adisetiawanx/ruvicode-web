import type { Metadata } from "next";
import type { BreadcrumbList, WithContext } from "schema-dts";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import Link from "next/link";
import { CodeDemo, type CodeTab } from "@/components/marketing/code-demo";
import { highlightCode } from "@/lib/shiki";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "Integrations - Works with Your Tools",
  description:
    "Ruvicode works with Cursor, Aider, Cline, LangChain, and any OpenAI-compatible tool. Change one base URL, paste your key, and go.",
  alternates: { canonical: "https://ruvicode.com/integrations" },
  openGraph: {
    title: "Integrations - Works with Your Tools",
    description:
      "Ruvicode works with Cursor, Aider, Cline, LangChain, and any OpenAI-compatible tool.",
    url: "https://ruvicode.com/integrations",
    siteName: "Ruvicode",
    type: "website",
    images: [
      {
        url: "https://ruvicode.com/og/ruvicode-default.png",
        width: 1200,
        height: 630,
        alt: "Ruvicode integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrations - Works with Your Tools",
    description:
      "Ruvicode works with Cursor, Aider, Cline, LangChain, and any OpenAI-compatible tool.",
    images: ["https://ruvicode.com/og/ruvicode-default.png"],
  },
};

interface Integration {
  name: string;
  tagline: string;
  /** Verified setup steps (against each tool's docs, Aug 2026). */
  steps: string[];
  config: string;
  configLang: string;
  note?: string;
}

const integrations: Integration[] = [
  {
    name: "Cursor",
    tagline: "Override the OpenAI base URL and bring your own key.",
    steps: [
      "Open Settings (Ctrl/Cmd+,) and go to Models.",
      "Enable OpenAI API Key and paste your rvcd_ key.",
      "Turn on Override OpenAI Base URL and enter the URL below.",
      "Add the models you want in the model list, then Verify.",
    ],
    config: `OPENAI_API_KEY=rvcd_...
OPENAI_BASE_URL=https://api.ruvicode.com/v1`,
    configLang: "bash",
    note: "Cursor sends OpenAI-format requests, so every model in our catalog works.",
  },
  {
    name: "Aider",
    tagline: "Point aider at any model with two environment variables.",
    steps: [
      "Install aider: python -m pip install aider-install && aider-install.",
      "Export OPENAI_API_BASE and OPENAI_API_KEY (or put them in .env).",
      "Run aider with the openai/ model prefix.",
    ],
    config: `export OPENAI_API_BASE=https://api.ruvicode.com/v1
export OPENAI_API_KEY=rvcd_...

aider --model openai/glm-5.2`,
    configLang: "bash",
    note: "The openai/ prefix is how aider routes to a custom endpoint.",
  },
  {
    name: "Cline",
    tagline: "Select the OpenAI Compatible provider and paste the base URL.",
    steps: [
      "Open the Cline settings panel (gear icon).",
      "Set API Provider to OpenAI Compatible.",
      "Paste the Base URL and your rvcd_ API key.",
      "Enter the model ID (e.g. claude-sonnet-5) and click Verify.",
    ],
    config: `Base URL: https://api.ruvicode.com/v1
API Key:  rvcd_...
Model:    claude-sonnet-5`,
    configLang: "bash",
    note: "Set the context window and max output tokens to match the model for accurate token tracking.",
  },
  {
    name: "LangChain",
    tagline: "One parameter on ChatOpenAI. Works with the whole chain ecosystem.",
    steps: [
      "pip install langchain langchain-openai.",
      "Pass base_url and your rvcd_ key to ChatOpenAI.",
      "Use any model from our catalog by slug.",
    ],
    config: `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="glm-5.2",
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1",
)`,
    configLang: "python",
  },
  {
    name: "OpenAI SDK",
    tagline: "The official SDKs work with a single baseURL change.",
    steps: [
      "Install the openai package for your language.",
      "Point it at our base URL with your rvcd_ key.",
      "Call chat.completions.create as usual.",
    ],
    config: `from openai import OpenAI

client = OpenAI(
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1",
)

resp = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Hello"}],
)`,
    configLang: "python",
  },
  {
    name: "OpenCode",
    tagline: "Custom OpenAI-compatible provider, list models explicitly.",
    steps: [
      "Create or edit opencode.json in your project root (or ~/.config/opencode/opencode.json for global).",
      "Add the ruvicode provider block below with your rvcd_ key and the models you want to use (OpenCode 1.x does not auto-fetch custom providers yet).",
      "Run /models in OpenCode and pick any model from the list.",
    ],
    config: `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ruvicode": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ruvicode",
      "options": {
        "baseURL": "https://api.ruvicode.com/v1",
        "apiKey": "rvcd_..."
      },
      "models": {
        "glm-5.2": { "name": "GLM 5.2", "limit": { "context": 1000000, "output": 128000 } },
        "claude-opus-5": { "name": "Claude Opus 5", "limit": { "context": 1000000, "output": 128000 }, "modalities": { "input": ["text", "image"], "output": ["text"] } },
        "deepseek-v4-flash": { "name": "DeepSeek V4 Flash", "limit": { "context": 1048576, "output": 384000 } }
      }
    }
  }
}`,
    configLang: "json",
    note: "OpenCode 1.x does not auto-fetch custom provider catalogs yet (Venice works because it is listed in models.dev). List model ids explicitly, and add modalities.input image for vision models, or OpenCode will refuse image attachments itself.",
  },
  {
    name: "OpenClaw",
    tagline: "Register Ruvicode as a custom OpenAI-completions provider.",
    steps: [
      "Open your OpenClaw config (config.json5 or the Control UI, Settings, Model Providers).",
      "Add a models.providers.ruvicode block with the base URL and your rvcd_ key.",
      "Set a model as primary with models set, then verify with models list.",
    ],
    config: `{
  models: {
    providers: {
      ruvicode: {
        baseUrl: "https://api.ruvicode.com/v1",
        apiKey: "rvcd_...",
        api: "openai-completions",
        models: [
          { id: "glm-5.2", name: "GLM 5.2", contextWindow: 1000000, maxTokens: 128000 },
          { id: "claude-opus-5", name: "Claude Opus 5", contextWindow: 1000000, maxTokens: 128000 }
        ],
      },
    },
  },
  agents: { defaults: { model: { primary: "ruvicode/glm-5.2" } } },
}`,
    configLang: "json",
    note: "Proxy-style OpenAI-compatible routes skip native OpenAI shaping automatically, so no extra compat flags are needed.",
  },
  {
    name: "Hermes Agent",
    tagline: "Point the custom provider at Ruvicode and swap models mid-session.",
    steps: [
      "Run hermes setup or hermes model and choose the custom provider.",
      "Set the base URL to https://api.ruvicode.com/v1 and paste your rvcd_ key (or set model.base_url and model.api_key in config.yaml).",
      "Switch models any time with /model <id>, e.g. /model glm-5.2.",
    ],
    config: `# ~/.hermes/config.yaml
model:
  provider: custom
  model: glm-5.2
  base_url: "https://api.ruvicode.com/v1"

# key goes in ~/.hermes/.env (secrets never live in config.yaml)
# MODEL_API_KEY=rvcd_...`,
    configLang: "yaml",
    note: "Model ids come straight from GET /v1/models, so every catalog model works.",
  },
  {
    name: "Anything else OpenAI-compatible",
    tagline: "Continue, Roo Code, LibreChat, your own proxy, scripts.",
    steps: [
      "Find the base URL / endpoint setting in your tool.",
      "Set it to https://api.ruvicode.com/v1.",
      "Use your rvcd_ key where the OpenAI key goes.",
    ],
    config: `base_url: https://api.ruvicode.com/v1
api_key: rvcd_...`,
    configLang: "bash",
    note: "If a tool speaks the OpenAI chat completions format, it works with Ruvicode.",
  },
];

export default async function IntegrationsPage() {
  const cards = await Promise.all(
    integrations.map(async (integration) => ({
      integration,
      tabs: [
        {
          label: "Setup",
          highlightedHtml: await highlightCode(integration.config, integration.configLang as never),
          rawCode: integration.config,
        },
      ] satisfies CodeTab[],
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
      <Container size="wide" className="py-16">
        <PageEntrance>
        {/* Header */}
        <PageEntranceItem>
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-text">
            Integrations
          </p>
          <h1 className="mb-3 text-h1 font-semibold text-text-primary">
            Works with your tools
          </h1>
          <p className="text-lg text-text-secondary">
            Change one base URL, paste your key, and every model in the
            catalog is available in your tool of choice. If it speaks the
            OpenAI API format, it works with Ruvicode.
          </p>
        </div>
        </PageEntranceItem>

        {/* Universal config callout */}
        <PageEntranceItem>
        <div className="mb-6 rounded-xl border border-accent/25 bg-accent-subtle p-6">
          <p className="mb-1 font-medium text-text-primary">
            Two values, every tool
          </p>
          <p className="mb-4 text-sm text-text-secondary">
            Whatever the settings screen calls them, you are always providing
            these two things. Everything else is just finding the right input
            field.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border-default bg-surface p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                Base URL
              </p>
              <p className="font-mono text-sm text-text-primary">
                https://api.ruvicode.com/v1
              </p>
            </div>
            <div className="rounded-lg border border-border-default bg-surface p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                API Key
              </p>
              <p className="font-mono text-sm text-text-primary">rvcd_...</p>
            </div>
          </div>
        </div>

        {/* Vision config note */}
        <div className="mb-12 rounded-xl border border-accent/25 bg-accent-subtle p-6">
          <p className="mb-1 font-medium text-text-primary">
            Vision models need a config flag in some tools
          </p>
          <p className="mb-4 text-sm text-text-secondary">
            OpenCode and OpenClaw refuse image attachments at the client
            side when a custom provider model lacks a{" "}
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">
              modalities
            </code>{" "}
            declaration, even though the API serves vision fine. Add it to
            each vision model entry:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border-default bg-surface p-4 font-mono text-xs">
{`"modalities": { "input": ["text", "image"], "output": ["text"] }`}
          </pre>
          <p className="mt-3 text-xs text-text-muted">
            Text-only models (DeepSeek V4, GLM-5.x, MiniMax M2.x) do not
            need it. The API itself accepts image content blocks on any
            model marked vision in the{" "}
            <Link
              href="/models"
              className="text-accent-text hover:text-accent-hover"
            >
              catalog
            </Link>
            .
          </p>
        </div>
        </PageEntranceItem>

        {/* Integration cards */}
        <PageEntranceItem>
        <div className="space-y-6">
          {cards.map(({ integration, tabs }) => (
            <div
              key={integration.name}
              className="min-w-0 rounded-xl border border-border-default bg-surface p-6 md:p-8"
            >
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                {/* Left: name, tagline, steps */}
                <div className="min-w-0">
                  <h2 className="mb-1 text-xl font-semibold text-text-primary">
                    {integration.name}
                  </h2>
                  <p className="mb-4 text-sm text-text-secondary">
                    {integration.tagline}
                  </p>
                  <ol className="space-y-2.5">
                    {integration.steps.map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] text-text-secondary">
                          {i + 1}
                        </span>
                        <span className="text-text-secondary">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {integration.note && (
                    <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {integration.note}
                    </p>
                  )}
                </div>
                {/* Right: config code */}
                <div className="min-w-0">
                  <CodeDemo tabs={tabs} />
                </div>
              </div>
            </div>
          ))}
        </div>
        </PageEntranceItem>

        {/* Bottom CTA */}
        <PageEntranceItem>
        <div className="mt-12 rounded-xl border border-border-default bg-surface p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Get your key in under a minute
          </h2>
          <p className="mx-auto mb-5 max-w-md text-sm text-text-secondary">
            Register, top up, generate an rvcd_ key, and paste it into any tool
            above. No subscription, top up from $0.01 in USDC.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover"
            >
              Get started free
            </a>
            <Link
              href="/docs/quickstart"
              className="inline-flex h-10 items-center gap-1 rounded-md border border-border-default px-5 text-sm font-medium text-text-primary transition-colors hover:border-accent/40"
            >
              Read the quickstart
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        </PageEntranceItem>
        </PageEntrance>
      </Container>
    </>
  );
}
