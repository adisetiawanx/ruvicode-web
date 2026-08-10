"use server";

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";
import { headers } from "next/headers";
import { limitPlaygroundRequest } from "@/lib/upstash";
import { getModelBySlug } from "@/lib/db/queries/models";

/**
 * Playground chat server action.
 *
 * Architecture: Browser → Server Action (rate limited) → Provider API →
 *   Sanitize → Browser
 *
 * This prevents:
 * - API key exposure in client-side code
 * - Direct browser-to-provider calls (leaks provider identity)
 * - Unlimited free API calls (rate limited by IP)
 */

const playgroundSchema = z.object({
  model: z.string().min(1).max(50),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string().min(1).max(32000),
      }),
    )
    .min(1)
    .max(20),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

export type PlaygroundResult =
  | {
      ok: true;
      data: {
        content: string;
        usage: { prompt_tokens: number; completion_tokens: number };
        cost: {
          input: number;
          output: number;
          total: number;
        } | null;
        remaining: number;
      };
    }
  | { ok: false; error: string; remaining?: number };

export async function playgroundChat(input: unknown): Promise<PlaygroundResult> {
  // 1. Validate input with Zod
  const result = playgroundSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: "Invalid request parameters" };
  }

  // 2. Rate limit by IP (5 requests per hour per IP)
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = await limitPlaygroundRequest(ip);

  if (!success) {
    return {
      ok: false,
      error: "Rate limit exceeded. Sign up for unlimited access.",
      remaining: 0,
    };
  }

  // 3. Forward to provider (server-side — API key never exposed to browser)
  const providerKey = process.env.PROVIDER_PLAYGROUND_KEY;
  const baseUrl = process.env.PROVIDER_BASE_URL;
  if (!providerKey || !baseUrl) {
    return {
      ok: false,
      error: "Playground is not configured. Please try again later.",
      remaining,
    };
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
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

async function calculatePlaygroundCost(
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number },
) {
  const pricing = await getModelBySlug(model);
  if (!pricing) return null;

  const inputCost = (usage.prompt_tokens / 1_000_000) * pricing.user_input;
  const outputCost =
    (usage.completion_tokens / 1_000_000) * pricing.user_output;
  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost,
  };
}
