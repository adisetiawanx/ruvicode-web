import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { resend, FROM_EMAIL } from "@/lib/email";
import { renderPasswordReset } from "@/lib/email/render";

/**
 * Better-auth configuration (ADR-008 revised — OAuth-First).
 *
 * Registration is OAuth-only (Google + GitHub). Email/password login
 * is available for users who set a password after OAuth registration.
 *
 * Account linking (email binding): users who sign in with Google and
 * GitHub using the same email are automatically linked to one account.
 * `trustedProviders` ensures OAuth emails are treated as verified.
 *
 * Password reset / set: the "forgot password" flow is dual-purpose —
 * it sets a password for OAuth-only users and resets for users who
 * have one. Resend sends the reset email.
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
    : undefined, // Falls back to memory adapter in dev without Docker
  secret: env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-not-for-prod",
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    // No email verification required — all users register via trusted OAuth
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Dual-purpose: sends reset/set password email via Resend
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.log(`[DEV] Password reset email for ${user.email}: ${url}`);
        return;
      }

      const html = await renderPasswordReset(url, user.name);

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Set your password",
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

  // Email binding — same email across providers = same account
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
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

  // Better Auth Dash (hosted dashboard) needs this plugin plus the API key
  // to verify ownership of this deployment.
  plugins: [dash()],
});

export type Session = (typeof auth.$Infer.Session)["session"];
