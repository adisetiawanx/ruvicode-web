import type { Metadata } from "next";
import { legalProseStyles } from "@/lib/legal-styles";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ruvicode collects, uses, and protects your data.",
  alternates: { canonical: "https://ruvicode.com/legal/privacy" },
  robots: { index: true, follow: true },
};

/**
 * Privacy Policy — must accurately describe what we collect AND
 * explicitly state we do NOT collect prompt/response content
 * (PROJECT.md §5 feature #8, privacy as a feature).
 */
export default function PrivacyPolicy() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">
          Privacy Policy
        </h1>
        <p className="text-sm text-text-muted">Last updated: August 2026</p>
      </header>

      <div className={legalProseStyles}>
        <h2>1. Data We Collect</h2>
        <p>
          We collect the following data necessary to operate the Service:
        </p>
        <ul>
          <li>
            <strong>Account information:</strong> name, email address,
            password hash
          </li>
          <li>
            <strong>Usage metadata:</strong> timestamp, model name, token
            counts, cost, API key ID
          </li>
          <li>
            <strong>Payment metadata:</strong> top-up amount, payment method,
            transaction date (we do not store card details)
          </li>
        </ul>

        <h2>2. Data We Do NOT Collect</h2>
        <p>
          We do not log or store the content of your prompts or AI model
          responses. Only usage metadata (token counts, model name, cost,
          timestamp) is retained for billing and usage reporting purposes.
        </p>
        <p>
          Your requests are routed to third-party model providers to fulfill
          your API calls. We do not control the data retention policies of
          these providers.
        </p>

        <h2>3. Payment Processing</h2>
        <p>
          Card payments are processed by Paddle, our payment processor and
          Merchant of Record. Paddle collects and processes card information
          in accordance with PCI-DSS standards. We do not store, process, or
          transmit card details.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          Usage metadata is retained for billing and account history for as
          long as your account is active. Upon account deletion, all
          associated data is permanently removed.
        </p>

        <h2>5. Data Sharing</h2>
        <p>
          We do not sell your data. Your API requests are forwarded to
          third-party AI model providers to fulfill your requests. No other
          third parties receive your data unless required by law.
        </p>

        <h2>6. Cookies</h2>
        <p>
          The Service uses a single session cookie for authentication. We do
          not use tracking cookies, analytics cookies, or advertising
          cookies.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          You may access, export, or delete your data at any time through the
          dashboard settings. To request data deletion, use the Delete
          Account function or email support@ruvicode.com.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy questions or data requests, email{" "}
          <a href="mailto:support@ruvicode.com">support@ruvicode.com</a>.
        </p>

        <h2>9. Entity</h2>
        <p>Ruvicode is operated by Adi, Sole Trader, Indonesia.</p>
      </div>
    </article>
  );
}
