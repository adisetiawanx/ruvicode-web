"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/shared/link-button";

export function CtaSection() {
  return (
    <section className="border-t border-border-subtle py-24">
      <Container size="content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-border-default bg-surface p-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-semibold">
            Ready to simplify your AI API access?
          </h2>
          <p className="mb-8 text-text-secondary">
            Join developers building with one key, transparent pricing, and hard
            spend limits.
          </p>
          <LinkButton href="/register" variant="primary" size="lg">
            Get Started Free →
          </LinkButton>
        </motion.div>
      </Container>
    </section>
  );
}
