"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { CodeDemo } from "./code-demo";
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

export function HeroSection() {
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
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <Badge
              variant="outline"
              className="mb-6 border-accent/30 text-accent-text"
            >
              Save up to 77% vs OpenRouter
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 text-5xl font-bold tracking-tight md:text-6xl"
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

        {/* Code demo below hero text */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
          className="mt-16 max-w-2xl"
        >
          <CodeDemo />
        </motion.div>
      </Container>
    </section>
  );
}
