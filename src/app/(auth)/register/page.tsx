"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

/**
 * Register page (ADR-008 revised — OAuth-First).
 *
 * Registration is OAuth-only. No email/password form.
 * After OAuth callback, user is redirected to /dashboard directly.
 */
export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-border-default bg-surface p-8">
        <h1 className="mb-2 text-center text-h2 font-semibold">
          Create your account
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Start using 20+ AI models with one API key.
        </p>

        {/* OAuth buttons — only way to register */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={
              <Link href="/api/auth/signin/social/google?callbackURL=/dashboard" />
            }
          >
            <Mail className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={
              <Link href="/api/auth/signin/social/github?callbackURL=/dashboard" />
            }
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
            </svg>
            Continue with GitHub
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        By signing up, you agree to our{" "}
        <Link
          href="/legal/terms"
          className="underline hover:text-text-secondary"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="underline hover:text-text-secondary"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-xs text-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
