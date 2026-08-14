import { z } from "zod";
import { getModelBySlug } from "@/lib/db/queries/models";

/**
 * Shared playground logic used by both the public playground
 * (src/app/(marketing)/playground) and the dashboard playground
 * (src/app/(dashboard)/dashboard/playground).
 *
 * The two server actions differ only in auth and rate limiting; the request
 * validation, provider URL building, response sanitization, and cost
 * estimation live here so they cannot drift apart.
 */

export const playgroundSchema = z.object({
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

export type PlaygroundInput = z.infer<typeof playgroundSchema>;

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

export type PlaygroundChatAction = (
  input: PlaygroundInput,
) => Promise<PlaygroundResult>;

/**
 * Build the chat completions URL for the provider. The configured
 * PROVIDER_BASE_URL may or may not include the /v1 segment (the gateway's
 * copy does, the web's does not), so never append it twice.
 */
export function playgroundProviderUrl(): string {
  const base = (process.env.PROVIDER_BASE_URL ?? "").replace(/\/+$/, "");
  if (!base) return "";
  return base.endsWith("/v1")
    ? `${base}/chat/completions`
    : `${base}/v1/chat/completions`;
}

/**
 * Estimate what this request would cost the user, using the model's current
 * Ruvicode pricing. Returns null when the model is not in the catalog.
 */
export async function calculatePlaygroundCost(
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
