import { z } from "zod";

/**
 * Shared playground logic used by both the public playground route
 * (src/app/api/playground/chat) and the dashboard playground route
 * (src/app/api/dashboard/playground/chat), and by the client component.
 *
 * The public playground lets anonymous visitors try exactly one model;
 * the dashboard playground runs the signed-in user's own key through the
 * gateway. Both stream responses so reasoning and tokens appear live.
 */

/**
 * The public playground's free model is whatever the freedom endpoint
 * currently serves (it rotates day to day). Resolved live from
 * GET /v1/models with a short cache; this constant is only the fallback
 * used when the endpoint is unreachable.
 */
export const publicPlaygroundFallbackModel = "deepseek-v4-flash-0731";

/**
 * Resolve the current free model id from the freedom endpoint, with a
 * short timeout and a small cache so every page render and chat request
 * does not pay a models round trip. Falls back to the last known id,
 * then to the fallback constant when never resolved successfully.
 *
 * Shared by the public playground page (display name) and the chat
 * route (actual routing), so the UI never shows a stale model name.
 */
let cachedFreeModel: { id: string; at: number } | null = null;
const FREE_MODEL_TTL_MS = 5 * 60 * 1000;

export async function resolveFreeModel(): Promise<string> {
  if (cachedFreeModel && Date.now() - cachedFreeModel.at < FREE_MODEL_TTL_MS) {
    return cachedFreeModel.id;
  }
  // Env is read lazily so build-time page data collection, which runs
  // without environment variables, never fails here.
  const key = process.env.FREEDOM_PLAYGROUND_API_KEY;
  const base = process.env.FREEDOM_PLAYGROUND_BASE_URL?.replace(/\/+$/, "");
  if (key && base) {
    try {
      const res = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = (await res.json()) as { data?: Array<{ id?: string }> };
        const id = data.data?.[0]?.id;
        if (id) {
          cachedFreeModel = { id, at: Date.now() };
          return id;
        }
      }
    } catch {
      // fall through to cache or fallback
    }
  }
  return cachedFreeModel?.id ?? publicPlaygroundFallbackModel;
}

export { displayModelName } from "@/lib/models/display";

export const playgroundSchema = z.object({
  model: z.string().min(1).max(50),
  keyId: z.string().min(1).max(64).optional(),
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
  max_tokens: z.number().min(1).max(4096).optional(), // hard schema cap; route clamps again
});

export type PlaygroundInput = z.infer<typeof playgroundSchema>;

/** A non-streaming error payload returned by a playground chat route. */
export interface PlaygroundErrorResponse {
  error: string;
  code?: string;
  remaining?: number;
}

// The provider reports settlement internals (cost, cost_details, is_byok)
// and its own identity (provider field, model echoed with an upstream
// prefix). Every SSE line is scrubbed before it reaches the browser.
// Mirrors the gateway's masking.SanitizeResponseBody.

const modelField = /"model"\s*:\s*"[^"]*"/;

// stripValue matches scalar JSON values and flat objects, bounded so it
// never spans a comma.
const stripValue = `(?:-?\\d+(?:\\.\\d+)?|"[^"]*"|true|false|null|\\{[^{}]*\\})`;

function stripField(data: string, field: string): string {
  const lead = new RegExp(`,\\s*"${field}"\\s*:\\s*${stripValue}`);
  const trail = new RegExp(`"${field}"\\s*:\\s*${stripValue},\\s*`);
  const bare = new RegExp(`"${field}"\\s*:\\s*${stripValue}`);
  return data.replace(lead, "").replace(trail, "").replace(bare, "");
}

const internalFields = ["provider", "cost", "cost_details", "is_byok"];

/** Rewrite the model to the requested id and drop upstream-internal fields. */
export function sanitizeBody(data: string, modelId: string): string {
  let d = data.replace(modelField, `"model":"${modelId}"`);
  for (const field of internalFields) {
    d = stripField(d, field);
  }
  return d;
}

/**
 * Sanitize one SSE line before forwarding: drop comments/keep-alives and
 * scrub the body. Returns null when the line must not be forwarded.
 */
export function sanitizeSSELine(line: string, modelId: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;
  if (!trimmed.startsWith("data:")) return null;
  return sanitizeBody(line, modelId);
}

export function stripCostField(data: string): string {
  return stripField(data, "cost");
}