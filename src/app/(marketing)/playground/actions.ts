"use server";

import DOMPurify from "isomorphic-dompurify";
import { headers } from "next/headers";
import { limitPlaygroundRequest } from "@/lib/upstash";
import {
  playgroundSchema,
  playgroundProviderUrl,
  calculatePlaygroundCost,
  type PlaygroundResult,
} from "@/lib/playground";

/**
 * Public playground chat server action.
 *
 * Architecture: Browser → Server Action (rate limited by IP) → Provider API →
 *   Sanitize → Browser
 *
 * This prevents:
 * - API key exposure in client-side code
 * - Direct browser-to-provider calls (leaks provider identity)
 * - Unlimited free API calls (rate limited by IP: 5 requests/hour)
 */
export async function playgroundChat(input: unknown): Promise<PlaygroundResult> {
  // 1. Validate input with Zod
  const result = playgroundSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: "Invalid request parameters" };
  }

  // 2. Rate limit by IP (5 requests per hour per IP)
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = await limitPlaygroundRequest(ip, 5, "1 h");

  if (!success) {
    return {
      ok: false,
      error: "Rate limit exceeded. Sign up for unlimited access.",
      remaining: 0,
    };
  }

  // 3. Forward to provider (server-side — API key never exposed to browser)
  const providerKey = process.env.PROVIDER_PLAYGROUND_KEY;
  const url = playgroundProviderUrl();
  if (!providerKey || !url) {
    return {
      ok: false,
      error: "Playground is not configured. Please try again later.",
      remaining,
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...result.data,
        stream: false,
      }),
    });

    if (!response.ok) {
      // Sanitized error — never leak provider identity
      return {
        ok: false,
        error: "Model temporarily unavailable. Please try again.",
        remaining,
      };
    }

    const data = await response.json();

    // 4. Sanitize response content (XSS prevention)
    const rawContent = data.choices?.[0]?.message?.content ?? "";
    const sanitizedContent = DOMPurify.sanitize(rawContent);

    // 5. Calculate cost estimate for display
    const usage = data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
    };
    const costEstimate = await calculatePlaygroundCost(
      result.data.model,
      usage,
    );

    return {
      ok: true,
      data: {
        content: sanitizedContent,
        usage: {
          prompt_tokens: usage.prompt_tokens ?? 0,
          completion_tokens: usage.completion_tokens ?? 0,
        },
        cost: costEstimate,
        remaining,
      },
    };
  } catch {
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
      remaining,
    };
  }
}
