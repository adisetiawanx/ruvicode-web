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
  } catch {
    return {
      ok: false,
      message: "Invalid email or password.",
    } as const;
  }

  // redirect() throws NEXT_REDIRECT internally, so it must stay OUTSIDE
  // the try/catch above or the throw gets swallowed as a login failure.
  redirect("/dashboard");
}
