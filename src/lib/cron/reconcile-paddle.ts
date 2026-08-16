/**
 * Paddle reconciliation cron (ADR-015 §6).
 *
 * Safety net: compares Ruvicode's topups table against Paddle's
 * transaction list to catch any missed webhooks.
 *
 * Can be triggered by:
 * - External cron (UptimeRobot/curl) hitting an API route
 * - Go gateway cron (future)
 *
 * If a transaction.completed exists in Paddle but NOT in topups table:
 *   → alert (missed webhook)
 *   → manually credit wallet (same logic as webhook handler)
 */

import { db, isDbAvailable } from "@/lib/db";
import { topups, wallets, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@/lib/env";
import crypto from "crypto";

interface ReconcileResult {
  checked: number;
  missed: number;
  credited: number;
  errors: string[];
}

/**
 * Reconcile Paddle transactions from the last 24 hours.
 * Returns a summary of checked/missed/credited counts.
 *
 * Requires PADDLE_API_KEY to be configured.
 */
export async function reconcilePaddleTransactions(): Promise<ReconcileResult> {
  if (!env.PADDLE_API_KEY) {
    return {
      checked: 0,
      missed: 0,
      credited: 0,
      errors: ["PADDLE_API_KEY not configured"],
    };
  }

  if (!isDbAvailable()) {
    return {
      checked: 0,
      missed: 0,
      credited: 0,
      errors: ["Database not available"],
    };
  }

  // Dynamic import to avoid loading Paddle SDK at module level
  const { Paddle } = await import("@paddle/paddle-node-sdk");
  const paddle = new Paddle(env.PADDLE_API_KEY);

  const result: ReconcileResult = {
    checked: 0,
    missed: 0,
    credited: 0,
    errors: [],
  };

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const transactionCollection = await paddle.transactions.list({
      "updatedAt[GTE]": last24h.toISOString(),
      status: ["completed"],
    });

    for await (const tx of transactionCollection) {
      result.checked++;

      // Check if we already have this transaction
      const [existing] = await db
        .select({ id: topups.id })
        .from(topups)
        .where(eq(topups.paddleTransactionId, tx.id))
        .limit(1);

      if (existing) continue; // Already processed — webhook worked

      // MISSED WEBHOOK — alert and manually process
      result.missed++;
      console.error("[reconcile] Missed Paddle webhook!", tx.id);

      const userId = tx.customData?.user_id as string | undefined;
      if (!userId) {
        result.errors.push(
          `Transaction ${tx.id}: no user_id in custom_data`,
        );
        continue;
      }

      const totalCents = tx.details?.totals?.total;
      if (!totalCents) {
        result.errors.push(`Transaction ${tx.id}: no total amount`);
        continue;
      }

      const amountInDollars = Number(totalCents) / 100;
      const fee = amountInDollars * 0.05 + 0.5;

      try {
        await db.transaction(async (txdb) => {
          await txdb.insert(topups).values({
            id: crypto.randomUUID(),
            userId,
            amount: amountInDollars.toFixed(2),
            method: "paddle",
            paddleTransactionId: tx.id,
            status: "completed",
            fee: fee.toFixed(4),
            completedAt: new Date(),
          });

          await txdb
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${amountInDollars}`,
              totalLoaded: sql`${wallets.totalLoaded} + ${amountInDollars}`,
              updatedAt: new Date(),
            })
            .where(eq(wallets.userId, userId));
        });

        result.credited++;

        // Send confirmation email
        const [walletRow] = await db
          .select({ balance: wallets.balance })
          .from(wallets)
          .where(eq(wallets.userId, userId))
          .limit(1);

        void walletRow; // balance already committed; no email (ADR-014 revised)
      } catch (err: unknown) {
        if (err instanceof Error && "code" in err && err.code === "23505") {
          // Race condition — already processed by webhook between check and insert
          continue;
        }
        result.errors.push(
          `Transaction ${tx.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } catch (err) {
    result.errors.push(
      `Paddle API error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return result;
}
