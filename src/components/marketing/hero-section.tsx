import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { CodeDemo, type CodeTab } from "./code-demo";
import { LinkButton } from "@/components/shared/link-button";

interface HeroSectionProps {
  codeTabs: CodeTab[];
}

/**
 * Hero section. Rendered as a server component with plain (unmounted)
 * elements so the LCP content paints in the first pass of the SSR HTML.
 *
 * Earlier this section used framer-motion entrance animations that started
 * the headline and code block at opacity 0. Under Lighthouse's simulated
 * network that pushed the LCP element's render past ~2s and cost the
 * performance score. The headline and code now render immediately; the
 * pattern in PAGES.md §5.3 (staggered page-load reveal) is intentionally
 * skipped above the fold in favor of Largest Contentful Paint.
 */
export function HeroSection({ codeTabs }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle radial glow — Clay tint, NOT gradient slop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-subtle), transparent)",
        }}
      />

      <Container size="wide" className="relative pb-24 pt-20 md:pb-32 md:pt-32">
        {/* Desktop: text left, code demo right — side-by-side at lg+ */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — text content */}
          <div>
            <div>
              <Badge
                variant="outline"
                className="mb-6 border-accent/30 text-accent-text"
              >
                Save up to 99% vs list price
              </Badge>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              One API Key.
              <br />
              Every AI Model.
              <br />
              <span className="text-accent">Transparent Pricing.</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg text-text-secondary">
              Pay per request, see exact costs in real-time, set hard spend
              limits. No credit card required to start.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <LinkButton href="/register" variant="primary" size="lg">
                Get Started Free →
              </LinkButton>
              <LinkButton href="/models" variant="outline" size="lg">
                View Models
              </LinkButton>
            </div>
          </div>

          {/* Right column — code demo (Shiki highlight, server-rendered) */}
          <div className="lg:pl-4">
            <CodeDemo tabs={codeTabs} />
          </div>
        </div>
      </Container>
    </section>
  );
}