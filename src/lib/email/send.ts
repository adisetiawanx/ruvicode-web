/**
 * Standalone email sending functions (ADR-014).
 *
 * These are used outside of the auth flow:
 * - sendLowBalanceEmail: triggered by cron when balance < $2.00
 * - sendTopupConfirmationEmail: triggered by Paddle webhook (ADR-015)
 *
 * All functions are no-ops when Resend is not configured (local dev).
 * Errors are caught and logged — email failure should never break
 * the calling flow (e.g., webhook must still return 200 after crediting wallet).
 *
 * JSX rendering is delegated to render.tsx (a .tsx file) because this
 * file is .ts and cannot contain JSX syntax.
 */

import { resend, FROM_EMAIL } from "@/lib/email";
import { renderLowBalance, renderTopupConfirmation } from "@/lib/email/render";

/**
 * Send a low-balance alert email.
 * Called by cron job when user balance falls below threshold.
 */
export async function sendLowBalanceEmail(
  to: string,
  balance: string,
): Promise<void> {
  if (!resend) return;

  try {
    const html = await renderLowBalance(balance);

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your balance is running low — Ruvicode",
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send low-balance email", err);
  }
}

/**
 * Send a top-up confirmation email.
 * Called by Paddle webhook handler after wallet is credited (ADR-015).
 * Non-blocking: errors are logged but not thrown — wallet is already credited.
 */
export async function sendTopupConfirmationEmail(
  to: string,
  amount: string,
  newBalance: string,
  method: string,
): Promise<void> {
  if (!resend) return;

  try {
    const html = await renderTopupConfirmation(amount, newBalance, method);

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Wallet credited — Ruvicode",
      html,
    });
  } catch (err) {
    // Log but don't throw — wallet is already credited, webhook must return 200
    console.error("[email] Failed to send topup confirmation email", err);
  }
}
