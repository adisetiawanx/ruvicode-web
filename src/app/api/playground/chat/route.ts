import { NextRequest } from "next/server";
import {
  playgroundSchema,
  sanitizeSSELine,
  resolveFreeModel,
  displayModelName,
} from "@/lib/playground";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public playground chat route.
 *
 * Anonymous visitors can try exactly one model, the free model served by
 * the freedom endpoint. The response is streamed so tokens and reasoning
 * appear live. The provider's identity stays masked: only our own headers
 * are set, and the upstream cost object is stripped from every SSE line.
 */
export async function POST(req: NextRequest) {
  // 1. Validate input.
  let parsed;
  try {
    parsed = playgroundSchema.safeParse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid request parameters" }, { status: 400 });
  }
  // 2a. The free model is whatever freedom currently serves; it rotates.
  // Read env lazily (runtime only) so build-time page data collection,
  // which runs without environment variables, never fails on validation.
  const freedomKey = process.env.FREEDOM_PLAYGROUND_API_KEY;
  const freedomBase = process.env.FREEDOM_PLAYGROUND_BASE_URL?.replace(/\/+$/, "");
  if (!freedomKey || !freedomBase) {
    return Response.json(
      { error: "Playground is not configured. Please try again later." },
      { status: 503 },
    );
  }
  // The free model rotates on the freedom endpoint and its id is not
  // known to the browser ahead of time, so any requested model is
  // accepted and rewritten to the current free model server-side.
  const freeModel = await resolveFreeModel();
  parsed.data.model = freeModel;

  // Identity context (server-side only, never in browser payloads): models
  // name themselves from stale training data, this states the actual model.
  parsed.data.messages = [
    { role: "system", content: `You are ${displayModelName(freeModel)}, running behind an API gateway. Your knowledge of your own version may be out of date. When the user asks which model or version they are talking to, you are ${displayModelName(freeModel)}. Keep the same tone and personality you normally have, and answer other questions as yourself.` },
    ...parsed.data.messages,
  ];

  // 2b. Server-side ceiling: the UI may lower max tokens, but a crafted
  // payload cannot raise it, which bounds the worst-case cost per request.
  const FREE_TIER_MAX_TOKENS = 4096;
  if ((parsed.data.max_tokens ?? 4096) > FREE_TIER_MAX_TOKENS) {
    parsed.data.max_tokens = FREE_TIER_MAX_TOKENS;
  }

  // 3. Forward to the freedom endpoint (server-side; the key never reaches
  // the browser). Free playground traffic is isolated from paid routing.
  const providerKey = freedomKey;
  const url = `${freedomBase}/chat/completions`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...parsed.data, stream: true, stream_options: { include_usage: true } }),
    });
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Sanitized error: never leak the provider's status or body.
    return Response.json(
      { error: "Model temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  // 4. Stream SSE back, scrubbing the upstream cost object from every line.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            // Drop comments and scrub provider identity/cost fields.
            const sanitized = sanitizeSSELine(line, parsed.data.model);
            if (sanitized !== null) {
              controller.enqueue(
                new TextEncoder().encode(sanitized + "\n"),
              );
            }
          }
        }
        const tail = sanitizeSSELine(buffer, parsed.data.model);
        if (buffer.length > 0 && tail !== null) {
          controller.enqueue(new TextEncoder().encode(tail));
        }
      } catch {
        controller.error(new Error("upstream stream interrupted"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

