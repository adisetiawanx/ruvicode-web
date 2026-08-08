import { OAuthButtons } from "@/components/auth/oauth-buttons";
import Link from "next/link";

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

        <OAuthButtons callbackURL="/dashboard" />
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
