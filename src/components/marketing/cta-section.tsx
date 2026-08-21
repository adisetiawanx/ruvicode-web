"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { useMounted } from "@/lib/hooks/use-mounted";
import { LinkButton } from "@/components/shared/link-button";

export function CtaSection() {
  const mounted = useMounted();
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="content">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-border-default bg-surface p-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-semibold">
            Start building with one key.
          </h2>
          <p className="mb-8 text-text-secondary">
            No credit card, no subscription, no lock-in. Top up what you need
            and pay per request.
          </p>
          <LinkButton href="/register" variant="primary" size="lg">
            Get Started Free →
          </LinkButton>
        </motion.div>
      </Container>
    </section>
  );
}
