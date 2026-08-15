import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero-section";
import { StatBar } from "@/components/marketing/stat-bar";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Suspense } from "react";
import { ModelShowcase } from "@/components/marketing/model-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FAQS } from "@/lib/constants";
import { CODE_SAMPLES } from "@/lib/code-samples";
import { highlightCode } from "@/lib/shiki";
import type { CodeTab } from "@/components/marketing/code-demo";
import {
  organizationJsonLd,
  faqJsonLd,
  JsonLdScript,
} from "@/lib/seo/json-ld";

export const revalidate = 3600; // SSG — hourly refresh for model data

export const metadata: Metadata = {
  title: "Ruvicode — One API Key, Every AI Model, Transparent Pricing",
  description:
    "Access Claude, GPT, Gemini, GLM, DeepSeek, Kimi and more with one API key. Transparent per-request pricing, hard spend limits. Save up to 77% vs OpenRouter.",
  alternates: { canonical: "https://ruvicode.com" },
  openGraph: {
    title: "Ruvicode — One API Key, Every AI Model",
    description: "Transparent AI API gateway. Save up to 77% vs OpenRouter.",
    url: "https://ruvicode.com",
    siteName: "Ruvicode",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruvicode — One API Key, Every AI Model",
    description: "Transparent AI API gateway. Save up to 77% vs OpenRouter.",
  },
};

export default async function LandingPage() {
  // Pre-highlight code samples with Shiki (server-side, zero client JS)
  const codeTabs: CodeTab[] = await Promise.all(
    CODE_SAMPLES.map(async (sample) => ({
      label: sample.label,
      highlightedHtml: await highlightCode(sample.code, sample.lang as never),
      rawCode: sample.code,
    })),
  );

  return (
    <>
      <JsonLdScript data={organizationJsonLd()} />
      <JsonLdScript data={faqJsonLd(FAQS as unknown as Array<{ q: string; a: string }>)} />
      <HeroSection codeTabs={codeTabs} />
      <StatBar />
      <FeatureGrid />
      <Suspense>
        <ModelShowcase />
      </Suspense>
      <HowItWorks />
      <CtaSection />
      <FaqSection />
    </>
  );
}
