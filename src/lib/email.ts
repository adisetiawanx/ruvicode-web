/**
 * Resend email client setup (ADR-014).
 *
 * Initializes the Resend client only if RESEND_API_KEY is present.
 * In local dev without an API key, `resend` is null and email-sending
 * functions fall back to console.log, allowing auth flows to work
 * without a live email service.
 *
 * All outbound email from Ruvicode uses support@ruvicode.com as the
 * sender. The domain is verified in Resend (DKIM + SPF + DMARC).
 */

import { Resend } from "resend";
import { env } from "@/lib/env";

// Initialize only if API key is present (allows local dev without email)
export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const FROM_EMAIL = "Ruvicode <support@ruvicode.com>";
export const SUPPORT_EMAIL = "support@ruvicode.com";
