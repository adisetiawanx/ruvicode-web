import type { Metadata } from "next";
import { legalProseStyles } from "@/lib/legal-styles";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the Ruvicode AI API gateway. API access, acceptable use, payment and billing, account suspension, and liability limitations.",
  alternates: { canonical: "https://ruvicode.com/legal/terms" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Terms of Service",
    description: "Terms governing use of the Ruvicode AI API gateway. API access, acceptable use, payment and billing, account suspension, and liability limitations.",
    url: "https://ruvicode.com/legal/terms",
    siteName: "Ruvicode",
    type: "website",
    images: [
      {
        url: "https://ruvicode.com/og/ruvicode-default.png",
        width: 1200,
        height: 630,
        alt: "Ruvicode terms of service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description: "Terms governing use of the Ruvicode AI API gateway. API access, acceptable use, payment and billing, account suspension, and liability limitations.",
    images: ["https://ruvicode.com/og/ruvicode-default.png"],
  },
};

/**
 * Terms of Service — must include Acceptable Use section (critical for
 * Paddle approval + abuse prevention per PROJECT.md §5 feature #13).
 */
export default function TermsOfService() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">
          Terms of Service
        </h1>
        <p className="text-sm text-text-muted">Last updated: August 2026</p>
      </header>

      <div className={legalProseStyles}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Ruvicode (&ldquo;the Service&rdquo;), you agree
          to be bound by these Terms of Service. If you do not agree, do not
          use the Service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          Ruvicode is a SaaS API product that provides unified access to
          multiple AI models through a single OpenAI-compatible endpoint.
          The Service is self-serve and automated, offering per-request
          billing through a prepaid wallet system.
        </p>

        <h2>3. Acceptable Use</h2>
        <p>Users must not use Ruvicode to:</p>
        <ul>
          <li>
            Generate illegal content, including content that exploits or
            harms minors
          </li>
          <li>
            Generate content that promotes terrorism, violence, or self-harm
          </li>
          <li>Send spam, phishing, or unsolicited communications</li>
          <li>
            Conduct any activity that violates applicable local, national, or
            international law
          </li>
          <li>
            Attempt to overload, disrupt, reverse-engineer, or damage the
            Service
          </li>
          <li>Resell or redistribute API access without authorization</li>
          <li>Circumvent rate limits, spend limits, or usage restrictions</li>
        </ul>
        <p>
          Accounts found violating these terms will be terminated immediately
          without refund. We reserve the right to suspend access at any time
          to protect the Service and its users.
        </p>

        <h2>4. Payment &amp; Billing</h2>
        <p>
          The Service uses a prepaid wallet model. You top up your wallet via
          card payment (processed by Paddle) or USDC cryptocurrency deposit.
          Each API request deducts the actual cost from your wallet balance.
          You are billed only for what you use.
        </p>

        <h2>5. API Usage</h2>
        <p>
          Each API key may be configured with rate limits and spend limits.
          The Service does not guarantee a specific uptime or availability
          level during the MVP phase. Model availability depends on upstream
          providers.
        </p>

        <h2>6. Account Security</h2>
        <p>
          You are responsible for maintaining the security of your API keys.
          Keep your keys confidential. You are liable for all usage
          associated with your keys. Notify us immediately at
          support@ruvicode.com if you believe a key has been compromised.
        </p>

        <h2>7. Account Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violations
          of these Terms. You may delete your account at any time through the
          dashboard settings. Upon termination, your API keys are revoked
          immediately.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of
          any kind. We are not liable for indirect, incidental, or
          consequential damages arising from the use of the Service. Our
          total liability shall not exceed the amount you have paid in the
          30 days preceding the claim.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes constitutes acceptance of the new Terms.
        </p>

        <h2>10. Contact &amp; Entity</h2>
        <p>
          Ruvicode is operated by the Ruvicode team. For questions
          about these Terms, email{" "}
          <a href="mailto:support@ruvicode.com">support@ruvicode.com</a>.
        </p>
      </div>
    </article>
  );
}
