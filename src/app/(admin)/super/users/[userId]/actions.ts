"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { getSession } from "@/lib/session";

const ALLOWED_METHODS = ["idr", "manual", "usdc", "paddle"] as const;

function isAdmin(email: string | null | undefined): boolean {
  return (
    !!email &&
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase())
  );
}

export interface AddTopupResult {
  ok: boolean;
  message?: string;
}

/**
 * Admin action: credit a user's wallet manually (ADR-024/025 scope, /super).
 *
 * Use cases: an on-chain deposit that failed to credit, an IDR top-up paid
 * via bank transfer/QRIS, or any other manual adjustment. Inserts a
 * completed topup row and credits the wallet in ONE atomic transaction,
 * then writes an admin_audit_log entry. The amount is always USD.
 */
export async function addManualTopupAction(
  userId: string,
  amountUsd: number,
  method: string,
  note: string,
): Promise<AddTopupResult> {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return { ok: false, message: "Unauthorized" };
  }
  if (!ALLOWED_METHODS.includes(method as (typeof ALLOWED_METHODS)[number])) {
    return { ok: false, message: "Invalid method" };
  }
  if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 10000) {
    return { ok: false, message: "Amount must be between 0 and 10000 USD" };
  }
  if (!isDbAvailable()) {
    return { ok: false, message: "Database unavailable" };
  }

  try {
    await db.transaction(async (tx) => {
      // Credit the wallet (creates the row if missing).
      await tx.execute(sql`
        INSERT INTO wallets (user_id, balance, total_loaded)
        VALUES (${userId}, ${amountUsd.toFixed(2)}, ${amountUsd.toFixed(2)})
        ON CONFLICT (user_id) DO UPDATE SET
          balance = wallets.balance + ${amountUsd.toFixed(2)},
          total_loaded = wallets.total_loaded + ${amountUsd.toFixed(2)},
          updated_at = NOW()
      `);

      // Record the topup as completed.
      await tx.execute(sql`
        INSERT INTO topups (id, user_id, amount, method, status, fee, note_admin, created_at, completed_at)
        VALUES (gen_random_uuid()::text, ${userId}, ${amountUsd.toFixed(2)}, ${method}::topup_method, 'completed', 0, ${note}, NOW(), NOW())
      `);

      // Audit trail.
      await tx.execute(sql`
        INSERT INTO admin_audit_log (admin_email, action, details, status)
        VALUES (${session.user.email}, 'manual_topup', ${JSON.stringify({
          userId,
          amountUsd,
          method,
          note,
        })}, 'completed')
      `);
    });
  } catch (e) {
    return { ok: false, message: "Failed to credit wallet" };
  }

  revalidatePath(`/super/users/${userId}`);
  revalidatePath("/super/users");
  revalidatePath("/super/financial");
  return { ok: true };
}
