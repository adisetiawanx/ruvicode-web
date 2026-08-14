"use server";

import { revalidatePath } from "next/cache";
import { createKeySchema } from "@/lib/validations/keys";
import { getSession } from "@/lib/session";
import {
  createApiKey,
  revokeApiKey,
  updateApiKeyLimits,
} from "@/lib/db/queries/management";

export type CreateKeyResult =
  | { ok: true; key: string; keyId: string }
  | { ok: false; errors?: Record<string, string[]>; message: string };

export async function createKeyAction(input: unknown): Promise<CreateKeyResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  // 1. Validate with Zod (server is source of truth — PAGES.md §8.4)
  const result = createKeySchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  // 2. Generate + store key (SHA-256 hash in real impl; prefix for display)
  try {
    const { keyId, fullKey } = await createApiKey(session.user.id, {
      label: result.data.label,
      rateLimitRpm: result.data.rateLimitRpm,
      spendLimitDaily: result.data.spendLimitDaily?.toString() ?? null,
      spendLimitMonthly: result.data.spendLimitMonthly?.toString() ?? null,
    });

    revalidatePath("/dashboard/keys");

    return { ok: true, key: fullKey, keyId }; // Key shown ONCE
  } catch {
    return {
      ok: false,
      message: "Failed to create key. Please try again.",
    };
  }
}

export async function revokeKeyAction(
  keyId: string,
): Promise<{ ok: boolean; message?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  // SECURITY: Ownership check is inside revokeApiKey — scoped to userId
  const success = await revokeApiKey(session.user.id, keyId);
  if (!success) {
    return { ok: false, message: "Key not found" };
  }

  revalidatePath("/dashboard/keys");
  return { ok: true };
}

export type UpdateKeyLimitsResult =
  | { ok: true }
  | { ok: false; errors?: Record<string, string[]>; message: string };

export async function updateKeyLimitsAction(
  keyId: string,
  input: unknown,
): Promise<UpdateKeyLimitsResult> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  const result = createKeySchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const success = await updateApiKeyLimits(session.user.id, keyId, {
    label: result.data.label,
    rateLimitRpm: result.data.rateLimitRpm,
    spendLimitDaily: result.data.spendLimitDaily?.toString() ?? null,
    spendLimitMonthly: result.data.spendLimitMonthly?.toString() ?? null,
  });
  if (!success) {
    return { ok: false, message: "Key not found" };
  }

  revalidatePath("/dashboard/keys");
  return { ok: true };
}
