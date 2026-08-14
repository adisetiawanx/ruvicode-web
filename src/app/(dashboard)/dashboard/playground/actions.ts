"use server";

import DOMPurify from "isomorphic-dompurify";
import { getSession } from "@/lib/session";
import { limitPlaygroundRequest } from "@/lib/upstash";
import {
  playgroundSchema,
  playgroundProviderUrl,
  calculatePlaygroundCost,
  type PlaygroundResult,
} from "@/lib/playground";

/**
 * Dashboard playground chat server action.
 *
 * Same sanitized provider path as the public playground, but gated behind a
 * session and rate limited per user (50 requests/hour) instead of per IP,
 * since the caller is a signed-in user.
 *
 * NOTE: this playground uses Ruvicode's playground key, so requests are not
 * charged to the user's wallet. Charging the wallet would require the
 * gateway to bill on behalf of a session, which is a separate internal
 * endpoint (future work).
 */
export async function dashboardPlaygroundChat(
  input: unknown,
): Promise<PlaygroundResult> {
  // 1. Session gate
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Sign in to use the playground." };
  }

  // 2. Validate input with Zod
  const result = playgroundSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: "Invalid request parameters" };
  }

  // 3. Rate limit per user (50 requests per hour)
  const { success, remaining } = await limitPlaygroundRequest(
    session.user.id,
    50,
    "1 h",
  );

  if (!success) {
    return {
      ok: false,
      error: "Playground limit reached for this hour. Try again later.",
      remaining: 0,
    };
  }

  // 4. Forward to provider (server-side — key never exposed to browser)
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
      return {
        ok: false,
        error: "Model temporarily unavailable. Please try again.",
        remaining,
      };
    }

    const data = await response.json();

    // 5. Sanitize response content (XSS prevention)
    const rawContent = data.choices?.[0]?.message?.content ?? "";
    const sanitizedContent = DOMPurify.sanitize(rawContent);

    // 6. Calculate cost estimate for display
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
