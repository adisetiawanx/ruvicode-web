"use client";

import { motion } from "framer-motion";
import { UserPlus, KeyRound, Rocket } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

const steps = [
  {
    icon: UserPlus,
    title: "Create account & top up",
    desc: "Register with email or OAuth. Add credit via card or USDC. No commitments, no subscription.",
  },
  {
    icon: KeyRound,
    title: "Get your API key",
    desc: "Generate a key in seconds. Set spend and rate limits per key. Your budget, your control.",
  },
  {
    icon: Rocket,
    title: "Start building",
    desc: "Point any OpenAI-compatible tool at our endpoint. Stream responses, see real costs in every header.",
  },
];

export function HowItWorks() {
  const isMobile = useIsMobile();
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="wide">
        <h2 className="mb-16 text-center text-3xl font-semibold">
          Get started in 3 steps
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div className="mb-2 font-mono text-sm text-accent-text">
                  Step {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
