import type { Metadata } from "next";
import { legalProseStyles } from "@/lib/legal-styles";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Ruvicode's 30-day money-back guarantee on wallet top-ups.",
  alternates: { canonical: "https://ruvicode.com/legal/refund" },
  robots: { index: true, follow: true },
};

/**
 * Refund Policy — CRITICAL for Paddle approval.
 *
 * Per PADDLE-REGISTRATION.md: unconditional 30-day money-back guarantee.
 * ZERO qualifiers ("except for...", "minus...", "if the user...").
 * Do NOT add conditions — Paddle will reject.
 */
export default function RefundPolicy() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">
          Refund Policy
        </h1>
        <p className="text-sm text-text-muted">Last updated: August 2026</p>
      </header>

      <div className={legalProseStyles}>
        <h2>30-Day Money-Back Guarantee</h2>
        <p>
          We offer a 30-day money-back guarantee on all wallet top-ups.
        </p>
        <p>
          If you are not satisfied with Ruvicode for any reason, contact
          support@ruvicode.com within 30 days of your purchase for a full
          refund of your remaining wallet balance.
        </p>
        <p>
          Refunds are processed to the original payment method within 5-10
          business days.
        </p>
        <p>
          For USDC deposits, refunds are issued in USDC to the original
          deposit address.
        </p>

        <h2>Contact</h2>
        <p>
          For refund requests or questions, email{" "}
          <a href="mailto:support@ruvicode.com">support@ruvicode.com</a>.
        </p>

        <h2>Entity</h2>
        <p>Ruvicode is operated by Adi, Sole Trader, Indonesia.</p>
      </div>
    </article>
  );
}
