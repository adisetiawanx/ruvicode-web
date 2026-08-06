"use server";

import { auth } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { isDisposableEmail } from "@/lib/constants";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(input: unknown) {
  // 1. Validate with Zod
  const result = registerSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  const { email, password, name } = result.data;

  // 2. Block disposable emails
  if (isDisposableEmail(email)) {
    return {
      ok: false,
      errors: { email: ["Disposable email addresses are not allowed"] },
      message: "Please use a real email address.",
    } as const;
  }

  // 3. Create user via Better-auth
  // (Better-auth handles IP-based rate limiting internally)
  const h = await headers();
  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: h,
    });

    // 4. Redirect to email verification page
    // (Wallet creation happens after email verification in a later ADR)
    redirect("/register/verify-email");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already") || message.includes("exists")) {
      return {
        ok: false,
        errors: { email: ["Email already registered"] },
        message: "This email is already registered. Try logging in.",
      } as const;
    }
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    } as const;
  }
}
