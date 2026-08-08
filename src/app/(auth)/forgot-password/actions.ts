"use server";

import { auth } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";

/**
 * Forgot password action (ADR-008 revised).
 *
 * Dual-purpose: works for both OAuth users (who need to SET a password)
 * and credential users (who need to RESET). Better-auth's requestPasswordReset
 * endpoint sends an email with a reset link regardless of whether the user
 * already has a password.
 *
 * For security, the response is always the same whether or not the email exists
 * — prevents user enumeration.
 */

export type ForgotPasswordResult =
  | { ok: true }
  | { ok: false; errors?: Record<string, string[]>; message: string };

export async function forgotPasswordAction(
  input: unknown,
): Promise<ForgotPasswordResult> {
  // 1. Validate with Zod
  const result = forgotPasswordSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  // 2. Call Better-auth's requestPasswordReset endpoint
  // This sends the reset/set password email via our sendResetPassword callback.
  // Response is always success (even if email doesn't exist) to prevent
  // user enumeration attacks.
  const h = await headers();
  try {
    await auth.api.requestPasswordReset({
      body: {
        email: result.data.email,
      },
      headers: h,
    });
  } catch {
    // Silently ignore — don't reveal whether email exists
  }

  return { ok: true };
}
