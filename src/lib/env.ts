import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables.
 * Fails at build time (not runtime) if required vars are missing.
 *
 * DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL are required for auth.
 * OAuth credentials are optional (auth works with email/password without them).
 */
export const env = createEnv({
  // Docker builds collect page data without runtime env vars; validation
  // would fail there even though the values exist at run time.
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
  server: {
    DATABASE_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    // Better Auth Dash ownership verification (empty until pasted from dash)
    BETTER_AUTH_API_KEY: z.string().optional(),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    PROVIDER_PLAYGROUND_KEY: z.string().optional(),
    // Public free playground: dedicated freedom endpoint + key so free
    // traffic is fully isolated from paid routing.
    FREEDOM_PLAYGROUND_BASE_URL: z.string().url().optional(),
    FREEDOM_PLAYGROUND_API_KEY: z.string().optional(),
    PROVIDER_BASE_URL: z.string().url().optional(),
    // Shared Redis used for the API key cache. The Go gateway reads
    // `apikey:{hash}` from this Redis, so the dashboard deletes the same
    // entry on revoke/limit change to make the change effective immediately.
    REDIS_URL: z.string().optional(),
    // Secret shared with the Go gateway for the internal playground endpoint
    // (POST /internal/playground/chat). Sent as X-Internal-Token.
    INTERNAL_API_TOKEN: z.string().optional(),
    BASE_RPC_URL: z.string().optional(),
    USDC_CONTRACT: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(),
    // Server-to-server gateway URL. Inside Docker the browser-facing
    // api host is not resolvable, so the web container talks to the
    // gateway service directly. Falls back to the public API URL.
    GATEWAY_INTERNAL_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    // Paddle (ADR-015)
    PADDLE_API_KEY: z.string().optional(),
    PADDLE_WEBHOOK_SECRET: z.string().optional(),
    PADDLE_ENV: z.enum(["sandbox", "production"]).optional().default("sandbox"),
    // Resend (ADR-014)
    RESEND_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    PROVIDER_PLAYGROUND_KEY: process.env.PROVIDER_PLAYGROUND_KEY,
    FREEDOM_PLAYGROUND_BASE_URL: process.env.FREEDOM_PLAYGROUND_BASE_URL,
    FREEDOM_PLAYGROUND_API_KEY: process.env.FREEDOM_PLAYGROUND_API_KEY,
    PROVIDER_BASE_URL: process.env.PROVIDER_BASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    INTERNAL_API_TOKEN: process.env.INTERNAL_API_TOKEN,
    BASE_RPC_URL: process.env.BASE_RPC_URL,
    USDC_CONTRACT: process.env.USDC_CONTRACT,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    GATEWAY_INTERNAL_URL: process.env.GATEWAY_INTERNAL_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    PADDLE_API_KEY: process.env.PADDLE_API_KEY,
    PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
    PADDLE_ENV: process.env.PADDLE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
