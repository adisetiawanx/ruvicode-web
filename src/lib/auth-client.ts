import { createAuthClient } from "better-auth/react";

/**
 * Better-auth client SDK (ADR-008 revised).
 *
 * Used for client-side auth operations:
 * - signIn.social({ provider, callbackURL }) — OAuth sign-in
 * - signIn.email() / signUp.email() — credential flows
 * - signOut()
 * - useSession() — reactive session state
 *
 * The client automatically POSTs to /api/auth/* endpoints.
 * GET-based <Link> to /api/auth/signin/social/* does NOT work —
 * the endpoint only accepts POST.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signOut,
  useSession,
} = authClient;
