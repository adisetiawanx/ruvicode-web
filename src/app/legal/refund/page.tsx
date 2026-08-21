import type { Metadata } from "next";
import { legalProseStyles } from "@/lib/legal-styles";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Ruvicode refund policy. 30-day money-back guarantee on unused wallet top-ups, how to request a refund, and processing times.",
  alternates: { canonical: "https://ruvicode.com/legal/refund" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Refund Policy",
    description: "Ruvicode refund policy. 30-day money-back guarantee on unused wallet top-ups, how to request a refund, and processing times.",
    url: "https://ruvicode.com/legal/refund",
    siteName: "Ruvicode",
    type: "website",
    images: [
      {
        url: "https://ruvicode.com/og/ruvicode-default.png",
        width: 1200,
        height: 630,
        alt: "Ruvicode refund policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy",
    description: "Ruvicode refund policy. 30-day money-back guarantee on unused wallet top-ups, how to request a refund, and processing times.",
    images: ["https://ruvicode.com/og/ruvicode-default.png"],
  },
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
          Contact support@ruvicode.com within 30 days of your purchase and
          we will refund your remaining wallet balance. No questions asked
          about the balance itself, but we do verify your account and
          transaction history before sending funds back (see How Refunds
          Are Calculated below).
        </p>
        <p>
          Refunds are processed to the original payment method within 5-10
          business days.
        </p>
        <p>
          For USDC deposits, refunds are issued in USDC to the original
          deposit address.
        </p>

        <h2>How Refunds Are Calculated</h2>
        <p>
          The refund covers your remaining wallet balance at the time we
          process the request. API requests you have already made are
          non-refundable, because each call incurs real upstream inference
          cost the moment it is served. You are never charged for requests
          that fail before a model response is returned.
        </p>
        <p>
          If a single request is billed but the model never produced a
          response (for example, a gateway 502 or a provider outage), that
          request is already recorded as failed and is not deducted from
          your balance. You do not need to claim a refund for it.
        </p>

        <h2>Persistent Errors</h2>
        <p>
          If you hit a recurring error on the same model, include the
          following in your refund email so we can verify it quickly and
          prevent false claims:
        </p>
        <ul>
          <li>
            The model slug and the approximate dates the errors occurred.
          </li>
          <li>
            The request IDs from the <code>X-Ruvicode-Request-ID</code>{" "}
            response header (find them in your dashboard usage history).
          </li>
          <li>
            The HTTP status or error type you received (for example, 503
            &ldquo;Service temporarily overloaded&rdquo;).
          </li>
        </ul>
        <p>
          We cross-check these against our usage records. Requests that
          completed with a model response are charged and not refunded,
          even if the output was not what you hoped for. The 30-day
          guarantee still applies to your remaining balance regardless.
        </p>

        <h2>Contact</h2>
        <p>
          For refund requests or questions, email{" "}
          <a href="mailto:support@ruvicode.com">support@ruvicode.com</a>.
        </p>

        <h2>Entity</h2>
        <p>Ruvicode is operated by the Ruvicode team.</p>
      </div>
    </article>
  );
}
