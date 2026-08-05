"use client";

import { motion } from "framer-motion";
import {
  Key,
  DollarSign,
  Shield,
  CreditCard,
  Zap,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: Key,
    title: "One Key, All Models",
    desc: "Access Claude, GPT, Gemini, GLM, DeepSeek, Kimi, and more from a single API key.",
  },
  {
    icon: DollarSign,
    title: "Transparent Costs",
    desc: "See exact per-request pricing in real-time via X-Cost headers. No opaque credit conversions.",
  },
  {
    icon: Shield,
    title: "Hard Spend Limits",
    desc: "Set per-key daily and monthly spend caps. Auto-suspend when limit is hit. Prevent runaway costs.",
  },
  {
    icon: CreditCard,
    title: "Pay Your Way",
    desc: "Top up with card via Paddle or USDC crypto. No foreign card barriers.",
  },
  {
    icon: Zap,
    title: "OpenAI Compatible",
    desc: "Works with Cursor, Aider, LangChain, Claude Code, and any OpenAI-compatible tool.",
  },
  {
    icon: Gauge,
    title: "Hard Rate Limits",
    desc: "Per-key rate limiting with sliding window. Protect your budget from runaway agents.",
  },
];

export function FeatureGrid() {
  return (
    <Container size="wide" className="py-24">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-lg border border-border-default bg-surface p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </Container>
  );
}
