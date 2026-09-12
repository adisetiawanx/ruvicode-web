"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db, isDbAvailable } from "@/lib/db";
import { getSession } from "@/lib/session";

const ALLOWED_METHODS = ["idr", "manual", "usdc"] as const;

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
  // Negative amounts are debits (manual corrections). They are clamped at
  // the database level so the balance can never go below zero.
  if (!Number.isFinite(amountUsd) || amountUsd === 0 || Math.abs(amountUsd) > 10000) {
    return { ok: false, message: "Amount must be between 0.01 and 10000 USD (or debit)" };
  }
  if (!isDbAvailable()) {
    return { ok: false, message: "Database unavailable" };
  }

  try {
    await db.transaction(async (tx) => {
      // Credit or debit the wallet. Debits (negative) clamp at zero and do
      // not touch total_loaded; credits also raise total_loaded.
      if (amountUsd >= 0) {
        await tx.execute(sql`
          INSERT INTO wallets (user_id, balance, total_loaded)
          VALUES (${userId}, ${amountUsd.toFixed(2)}, ${amountUsd.toFixed(2)})
          ON CONFLICT (user_id) DO UPDATE SET
            balance = wallets.balance + ${amountUsd.toFixed(2)},
            total_loaded = wallets.total_loaded + ${amountUsd.toFixed(2)},
            updated_at = NOW()
        `);
      } else {
        const debit = (-amountUsd).toFixed(2);
        // Clamp: never below zero. GREATEST(balance - debit, 0); total_spent
        // records only what was actually removed.
        await tx.execute(sql`
          UPDATE wallets SET
            balance = GREATEST(balance - ${debit}, 0),
            total_spent = total_spent + LEAST(${debit}, GREATEST(balance, 0)),
            updated_at = NOW()
          WHERE user_id = ${userId}
        `);
      }

      // Record the topup as completed.
      const signedAmount = amountUsd >= 0 ? amountUsd.toFixed(2) : (-amountUsd).toFixed(2);
      await tx.execute(sql`
        INSERT INTO topups (id, user_id, amount, method, status, fee, note_admin, created_at, completed_at)
        VALUES (gen_random_uuid()::text, ${userId}, ${signedAmount}, ${method}::topup_method,
          'completed', 0, ${amountUsd < 0 ? `[debit] ${note}` : note}, NOW(), NOW())
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
