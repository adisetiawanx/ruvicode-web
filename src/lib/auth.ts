import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { resend, FROM_EMAIL } from "@/lib/email";
import { renderVerifyEmail, renderPasswordReset } from "@/lib/email/render";

/**
 * Better-auth configuration.
 *
 * Uses email/password + OAuth (Google/GitHub) with session-based auth.
 * When DATABASE_URL is configured, uses Drizzle adapter against Postgres.
 * When not configured (local dev without Docker), falls back to
 * memory adapter — auth operations work but don't persist.
 *
 * Email verification (ADR-014): When RESEND_API_KEY is set, verification
 * emails are sent via Resend. Without it, verification URLs are logged
 * to console (local dev fallback).
 */
export const auth = betterAuth({
  database: env.DATABASE_URL
    ? drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      })
    : undefined, // Falls back to memory adapter
  secret: env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-not-for-prod",
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.log(`[DEV] Password reset email for ${user.email}: ${url}`);
        return;
      }

      const html = await renderPasswordReset(url, user.name);

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your password — Ruvicode",
        html,
      });
    },
  },
  socialProviders: {
    google: env.GOOGLE_CLIENT_ID
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
        }
      : undefined,
    github: env.GITHUB_CLIENT_ID
      ? {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
        }
      : undefined,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24h
  },
  rateLimit: {
    enabled: true,
    window: 10, // 10 seconds between requests
    max: 5, // Max 5 requests per window per IP
  },
  // Email verification — hooked into Resend (ADR-014)
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        // Local dev fallback — log to console instead of sending
        console.log(`[DEV] Verification email for ${user.email}: ${url}`);
        return;
      }

      const html = await renderVerifyEmail(url, user.name);

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Verify your email — Ruvicode",
        html,
      });
    },
  },
});

export type Session = (typeof auth.$Infer.Session)["session"];
