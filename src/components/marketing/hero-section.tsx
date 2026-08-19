"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { CodeDemo, type CodeTab } from "./code-demo";
import { LinkButton } from "@/components/shared/link-button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface HeroSectionProps {
  codeTabs: CodeTab[];
}

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
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Badge
                variant="outline"
                className="mb-6 border-accent/30 text-accent-text"
              >
                Save up to 99% vs list price
              </Badge>
            </motion.div>

            <motion.h1
              variants={item}
              className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              One API Key.
              <br />
              Every AI Model.
              <br />
              <span className="text-accent">Transparent Pricing.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mb-8 max-w-xl text-lg text-text-secondary"
            >
              Pay per request, see exact costs in real-time, set hard spend
              limits. No credit card required to start.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <LinkButton href="/register" variant="primary" size="lg">
                Get Started Free →
              </LinkButton>
              <LinkButton href="/models" variant="outline" size="lg">
                View Models
              </LinkButton>
            </motion.div>
          </motion.div>

          {/* Right column — code demo with Shiki highlighting */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="lg:pl-4"
          >
            <CodeDemo tabs={codeTabs} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
