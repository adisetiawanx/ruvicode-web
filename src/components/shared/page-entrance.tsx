"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function PageEntranceItem({ children }: { children: ReactNode }) {
  return <motion.div variants={itemVariants}>{children}</motion.div>;
}
