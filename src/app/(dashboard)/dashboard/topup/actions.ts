"use server";

import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { getSession } from "@/lib/session";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

/**
 * Paddle transaction creation Server Action (ADR-015 §5).
 *
 * Called by the top-up UI when user clicks "Continue to Checkout".
 * Creates a Paddle transaction with inline pricing and returns the
 * transaction ID plus checkout URL for the client to redirect to.
 *
 * Security:
 * - Session validated (user must be logged in)
 * - session.user.id must match input.userId (no cross-user transactions)
 * - Amount validated server-side ($5–$10,000) even if client validated
 * - custom_data.user_id is set by us (NOT read from client) — webhook uses this
 */

export type CreatePaddleTransactionResult =
  | { ok: true; transactionId: string; checkoutUrl: string }
  | { ok: false; message: string };

export async function createPaddleTransaction(input: {
  amount: number;
  userId: string;
}): Promise<CreatePaddleTransactionResult> {
  // 1. Validate session
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  // 2. Ownership check — user can only create transactions for themselves
  if (session.user.id !== input.userId) {
    return { ok: false, message: "Unauthorized" };
  }

  // 3. Server-side amount validation (never trust client)
  if (input.amount < 5 || input.amount > 10000) {
    return { ok: false, message: "Amount must be between $5 and $10,000" };
  }

  // 4. Check Paddle API key
  if (!env.PADDLE_API_KEY) {
    return { ok: false, message: "Payment is not configured yet." };
  }

  // 5. Create Paddle transaction on the right environment
  // (SDK defaults to production; a sandbox key against production 401s)
  const paddle =
    env.PADDLE_ENV === "production"
      ? new Paddle(env.PADDLE_API_KEY)
      : new Paddle(env.PADDLE_API_KEY, { environment: Environment.sandbox });

  try {
    const transaction = await paddle.transactions.create({
      items: [
        {
          quantity: 1,
          price: {
            // Paddle amounts are decimal strings in major units ("5.00"),
            // not cents.
            description: `Ruvicode Wallet Top-Up $${input.amount.toFixed(2)}`,
            product: {
              name: "Ruvicode Wallet Credits",
              taxCategory: "saas",
            },
            unitPrice: {
              amount: input.amount.toFixed(2),
              currencyCode: "USD",
            },
          },
        },
      ],
      customData: {
        user_id: session.user.id, // Webhook reads this to credit the right wallet
        amount_cents: String(Math.round(input.amount * 100)),
      },
    });

    const checkoutUrl = transaction.checkout?.url;
    if (!checkoutUrl) {
      return {
        ok: false,
        message: "Checkout is not ready yet. Please try again later.",
      };
    }

    revalidatePath("/dashboard/topup");
    return { ok: true, transactionId: transaction.id, checkoutUrl };
  } catch (err) {
    console.error("[paddle] Transaction creation failed", err);
    return {
      ok: false,
      message: "Failed to create checkout. Please try again.",
    };
  }
}
