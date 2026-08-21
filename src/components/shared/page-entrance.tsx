"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

/**
 * Reusable page entrance animation (PAGES.md §5.3).
 *
 * Staggered fade-in + slide-up for page sections.
 * Usage: wrap page content sections in <PageEntrance>...</PageEntrance>
 *
 * Respects prefers-reduced-motion (globals.css forces 0.01ms durations).
 */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function PageEntrance({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <motion.div
      variants={containerVariants}
      initial={isMobile ? false : "hidden"}
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function PageEntranceItem({ children }: { children: ReactNode }) {
  // min-w-0: motion.div is often a CSS grid/flex child; grid items default to
  // min-width auto which prevents shrinking below content width (ADR-031 bug
  // class). Without this, long code lines blow out mobile layouts.
  return (
    <motion.div variants={itemVariants} className="min-w-0 w-full">
      {children}
    </motion.div>
  );
}
