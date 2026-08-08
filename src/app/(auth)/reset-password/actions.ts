"use server";

import { auth } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Reset password action (ADR-008 revised).
 *
 * Called when user submits the new password form on /reset-password?token=...
 * Better-auth's resetPassword endpoint verifies the token from the email link
 * and sets the new password.
 *
 * This is dual-purpose: works for OAuth users (setting password for the first
 * time) and credential users (resetting existing password).
 *
 * Token comes from the URL query param, not from user input.
 */

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; errors?: Record<string, string[]>; message: string };

export async function resetPasswordAction(
  input: { password: string; confirmPassword: string; token: string },
): Promise<ResetPasswordResult> {
  // 1. Validate with Zod
  const result = resetPasswordSchema.safeParse({
    password: input.password,
    confirmPassword: input.confirmPassword,
  });
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  // 2. Call Better-auth's resetPassword endpoint
  // The token is verified server-side by Better-auth
  const h = await headers();
  try {
    await auth.api.resetPassword({
      body: {
        newPassword: result.data.password,
        token: input.token,
      },
      headers: h,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("expired") || message.includes("invalid")) {
      return {
        ok: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      } as const;
    }
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    } as const;
  }

  // 3. Redirect to login on success
  redirect("/login?reset=success");
}
