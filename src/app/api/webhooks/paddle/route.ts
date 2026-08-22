import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, isDbAvailable } from "@/lib/db";
import { topups, wallets, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@/lib/env";

/**
 * Paddle webhook handler (ADR-015).
 *
 * Security-critical money-in pipeline:
 * 1. Verify Paddle signature (HMAC-SHA256 with webhook secret)
 * 2. Parse event type (only process transaction.completed)
 * 3. Idempotency check (unique constraint on paddle_transaction_id)
 * 4. Atomic wallet credit (Postgres transaction: topup + wallet update)
 * 5. Send confirmation email (non-blocking)
 *
 * CRITICAL: Raw body must be read BEFORE JSON parse for signature verification.
 * The `runtime = "nodejs"` and `dynamic = "force-dynamic"` exports ensure
 * Next.js does not pre-parse the body or cache the route.
 */

export const runtime = "nodejs"; // Need crypto module — not edge
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Get raw body as text — MUST be before JSON.parse for signature verification
  const rawBody = await req.text();

  // 2. Verify Paddle signature. Paddle Billing sends the signature in
  // the `Paddle-Signature` header (not `Signature`).
  const signatureHeader =
    req.headers.get("paddle-signature") ?? req.headers.get("signature") ?? "";

  if (!env.PADDLE_WEBHOOK_SECRET) {
    console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const isValid = verifyPaddleSignature(
    rawBody,
    signatureHeader,
    env.PADDLE_WEBHOOK_SECRET,
  );

  if (!isValid) {
    console.error("[paddle-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Parse the verified body
  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[paddle-webhook] Failed to parse JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 4. Only process completed transactions — acknowledge others
  if (event.event_type !== "transaction.completed") {
    return NextResponse.json({ received: true });
  }

  const transaction = event.data;
  const transactionId = transaction.id;

  if (!transactionId) {
    console.error("[paddle-webhook] No transaction ID in event");
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
  }

  // Extract amounts (Paddle sends cents as strings, e.g., "2500" = $25.00).
  // credit = SUBTOTAL (the wallet credits the user bought); the checkout
  // total also includes VAT which Paddle (as MoR) collects and remits, so
  // crediting `total` would credit more than the credits are worth.
  // fee = total - subtotal = VAT + Paddle processing, what we actually lose.
  const subtotalCents = transaction.details?.totals?.subtotal;
  const totalCents = transaction.details?.totals?.total;
  if (!subtotalCents || !totalCents) {
    console.error("[paddle-webhook] No totals in transaction", { transactionId });
    return NextResponse.json({ error: "Missing totals" }, { status: 400 });
  }

  const amountInDollars = Number(subtotalCents) / 100;
  const feeInDollars = (Number(totalCents) - Number(subtotalCents)) / 100;

  // Extract user_id from custom_data (set by our Server Action)
  const userId = transaction.custom_data?.user_id;

  if (!userId) {
    console.error("[paddle-webhook] No user_id in custom_data", { transactionId });
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  // 5. Check DB availability
  if (!isDbAvailable()) {
    console.error("[paddle-webhook] Database not available");
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  // 6. Idempotency check — prevent double-credit on Paddle retry
  const [existing] = await db
    .select({ id: topups.id })
    .from(topups)
    .where(eq(topups.paddleTransactionId, transactionId))
    .limit(1);

  if (existing) {
    // Already processed — Paddle retried, we already credited
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 7. Fee = what Paddle adds on top (VAT + processing), already computed

  // 8. Atomic wallet credit + topup record in a Postgres transaction
  try {
    await db.transaction(async (tx) => {
      // Insert topup record
      await tx.insert(topups).values({
        id: crypto.randomUUID(),
        userId,
        amount: amountInDollars.toFixed(2),
        method: "paddle",
        paddleTransactionId: transactionId,
        status: "completed",
        fee: feeInDollars.toFixed(4),
        completedAt: new Date(),
      });

      // Credit wallet atomically
      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${amountInDollars}`,
          totalLoaded: sql`${wallets.totalLoaded} + ${amountInDollars}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, userId));
    });
  } catch (err: unknown) {
    // If it's a unique constraint violation on paddleTransactionId,
    // it's a race condition — another webhook beat us to it. That's fine.
    if (err instanceof Error && "code" in err && err.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[paddle-webhook] DB error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  // 9. Send confirmation email (non-blocking — don't fail webhook if email fails)
  try {
    const [walletRow] = await db
      .select({ balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    void walletRow; // balance already committed; no email (ADR-014 revised)
  } catch {
    // Wallet is already credited; nothing else to do
  }

  // 10. Return 200 — Paddle stops retrying
  return NextResponse.json({ received: true });
}

/**
 * Verify Paddle webhook signature using HMAC-SHA256.
 *
 * Paddle sends: Signature: ts=1234567890;h1=abc123...
 * The signature is HMAC-SHA256 of `${ts}:${rawBody}` using the webhook secret.
 * Uses timing-safe comparison to prevent timing attacks.
 */
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  // Parse the signature header: ts=...;h1=...
  const parts = signatureHeader.split(";").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const ts = parts["ts"];
  const h1 = parts["h1"];

  if (!ts || !h1) return false;

  // Compute HMAC-SHA256
  const signedPayload = `${ts}:${rawBody}`;
  const computedHmac = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // Timing-safe comparison
  if (computedHmac.length !== h1.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac),
      Buffer.from(h1),
    );
  } catch {
    return false;
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

// ── Types ──

interface PaddleEvent {
  event_type: string;
  data: {
    id: string;
    status: string;
    details?: {
      totals?: {
        subtotal?: string; // credits subtotal, cents, e.g., "2500"
        total?: string; // grand total incl. VAT, cents
      };
    };
    custom_data?: {
      user_id?: string;
      amount_cents?: string;
    };
  };
}
