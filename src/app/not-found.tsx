import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Compass } from "lucide-react";

/**
 * 404 page — returns HTTP 404 status (Next.js default for not-found.tsx).
 * Per ADR-012 §3: centered card with icon, message, and navigation CTAs.
 * Does NOT reflect URL path back to user (no XSS via crafted URL).
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/30 bg-accent-subtle">
        <Compass className="h-10 w-10 text-accent" strokeWidth={1.5} />
      </div>
      <p className="mb-2 font-mono text-sm text-accent-text">404 — Not Found</p>
      <h1 className="mb-3 text-3xl font-bold text-text-primary">
        This page drifted off.
      </h1>
      <p className="mb-8 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover active:bg-accent-pressed"
        >
          Go Home
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          Browse Docs
        </Link>
      </div>
    </Container>
  );
}
