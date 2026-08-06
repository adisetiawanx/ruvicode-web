import { betterAuth } from "better-auth";
import { env } from "@/lib/env";

/**
 * Better-auth configuration.
 *
 * Uses email/password + OAuth (Google/GitHub) with session-based auth.
 * Requires DATABASE_URL to be set for full functionality.
 *
 * If DATABASE_URL is not configured (local dev without Docker),
 * auth operations will throw — but the config itself loads without error
 * so the build succeeds and auth pages render.
 */
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-not-for-prod",
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
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
});

export type Session = (typeof auth.$Infer.Session)["session"];
