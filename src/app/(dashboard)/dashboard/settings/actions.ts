"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validations/keys";
import { changePasswordSchema, setPasswordSchema } from "@/lib/validations/auth";

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

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<
  | { ok: true }
  | { ok: false; errors?: Record<string, string[]>; message: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  const result = changePasswordSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  try {
    const h = await headers();
    await auth.api.changePassword({
      headers: h,
      body: {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Invalid password") || message.includes("incorrect")) {
      return {
        ok: false,
        errors: { currentPassword: ["Current password is incorrect"] },
        message: "Current password is incorrect.",
      } as const;
    }
    return {
      ok: false,
      message: "Failed to change password. Please try again.",
    } as const;
  }
}

export async function setPasswordAction(input: {
  newPassword: string;
  confirmPassword: string;
}): Promise<
  | { ok: true }
  | { ok: false; errors?: Record<string, string[]>; message: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  const result = setPasswordSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    } as const;
  }

  try {
    const h = await headers();
    // user is already authenticated — set a password directly (no current password)
    await auth.api.setPassword({
      headers: h,
      body: {
        newPassword: result.data.newPassword,
      },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Failed to set password. Please try again.",
    } as const;
  }
}

export async function deleteAccountAction(confirmText: string) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  // Confirmation is a typed DELETE phrase (case-sensitive), which works for
  // both OAuth-only users and users with a password. Better-auth's deleteUser
  // needs no password in the body when called from an authenticated session.
  if (confirmText !== "DELETE") {
    return { ok: false, message: 'Please type "DELETE" to confirm.' };
  }

  try {
    const h = await headers();
    await auth.api.deleteUser({
      headers: h,
      body: {
        callbackURL: "/login?deleted=true",
      },
    });

    redirect("/login?deleted=true");
  } catch {
    return {
      ok: false,
      message: "Failed to delete account. Please try again.",
    };
  }
}
