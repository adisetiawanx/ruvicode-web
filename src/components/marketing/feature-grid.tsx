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
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: Key,
    title: "One key, every model",
    desc: "Claude, GPT, Gemini, GLM, DeepSeek, Kimi, and more. One key, one endpoint, one bill. Switch models by changing the model id, nothing else.",
  },
  {
    icon: DollarSign,
    title: "Real costs, every request",
    desc: "Every response includes an X-Cost header showing exactly what you paid. No credit conversion, no rounding, no surprises at the end of the month.",
  },
  {
    icon: Shield,
    title: "Spend limits that hold",
    desc: "Set daily and monthly spend caps per key. When a limit is hit, requests stop. No runaway agent loops, no surprise bills.",
  },
  {
    icon: CreditCard,
    title: "Card or crypto",
    desc: "Top up with any major card or USDC on Base. No foreign card rejections, deposits from $0.01.",
  },
  {
    icon: Zap,
    title: "Works with your tools",
    desc: "Change one base URL and your existing OpenAI SDK, Cursor, Aider, Cline, LangChain, or agent works. No SDK swap, no code rewrite.",
  },
  {
    icon: Gauge,
    title: "Rate limits that scale",
    desc: "Per-key rate limiting with a sliding window. Raise or lower limits per key anytime. Built for agentic workloads that burst.",
  },
];

export function FeatureGrid() {
  const isMobile = useIsMobile();
  return (
    <Container size="wide" className="py-24">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-lg border border-border-default bg-surface p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle">
                              <Icon className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="mb-2 font-semibold">{feature.title}</h2>
                            <p className="text-sm text-text-secondary">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </Container>
  );
}
