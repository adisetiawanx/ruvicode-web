"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validations/keys";

export async function updateProfileAction(input: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  const result = updateProfileSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  try {
    const h = await headers();
    await auth.api.updateUser({
      headers: h,
      body: { name: result.data.name },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

export async function deleteAccountAction(password: string) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  // In production: verify password, cascade delete wallet/keys/usage/topups
  // Better-auth's deleteUser accepts { password, callbackURL, token }.
  // For now, this is a placeholder that shows the intended flow.
  try {
    const h = await headers();
    await auth.api.deleteUser({
      headers: h,
      body: {
        password,
        callbackURL: "/login?deleted=true",
      },
    });

    redirect("/login?deleted=true");
  } catch {
    return {
      ok: false,
      message: "Failed to delete account. Please verify your password.",
    };
  }
}
