/**
 * Resend email client setup (ADR-014).
 *
 * Initializes the Resend client only if RESEND_API_KEY is present.
 * In local dev without an API key, `resend` is null and email-sending
 * functions fall back to console.log — allowing auth flows to work
 * without a live email service.
 *
 * From address: uses Resend's default domain (on.resend.com) in dev.
 * In production, update FROM_EMAIL to "noreply@ruvicode.com" after
 * verifying the domain in Resend dashboard (DKIM + SPF + DMARC).
 */

import { Resend } from "resend";
import { env } from "@/lib/env";

// Initialize only if API key is present (allows local dev without email)
export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// In production, this should be "Ruvicode <noreply@ruvicode.com>"
// For local dev / unverified domain, use Resend's default domain
export const FROM_EMAIL = "Ruvicode <onboarding@resend.dev>";
export const SUPPORT_EMAIL = "support@ruvicode.com";
