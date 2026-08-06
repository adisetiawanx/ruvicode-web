"use server";

import { auth } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(input: unknown) {
  const result = loginSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  const h = await headers();
  try {
    await auth.api.signInEmail({
      body: {
        email: result.data.email,
        password: result.data.password,
      },
      headers: h,
    });

    redirect("/dashboard");
  } catch {
    return {
      ok: false,
      message: "Invalid email or password.",
    } as const;
  }
}
