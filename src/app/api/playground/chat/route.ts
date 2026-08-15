import { NextRequest } from "next/server";
import { limitPlaygroundRequest } from "@/lib/upstash";
import {
  playgroundSchema,
  playgroundProviderUrl,
  publicPlaygroundModel,
  sanitizeSSELine,
} from "@/lib/playground";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public playground chat route.
 *
 * Anonymous visitors can try exactly one model (deepseek-v4-flash), 5
 * requests per day per IP. The response is streamed so tokens and reasoning
 * appear live. The provider's identity stays masked: only our own headers
 * are set, and the upstream cost object is stripped from every SSE line.
 */
export async function POST(req: NextRequest) {
  // 1. Abuse control (not a hard quota): the playground is unlimited for
  // humans, but scripted abuse via curl/IDEs gets throttled hard. A short
  // sliding window of 10 requests per minute per IP stops bulk hammering
  // while never touching a normal interactive session.
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = await limitPlaygroundRequest(ip, 10, "1 m");
  if (!success) {
    return Response.json(
      {
        error: "Too many requests. Slow down or sign up for an API key.",
        remaining: 0,
      },
      { status: 429 },
    );
  }

  // 2. Validate input.
  let parsed;
  try {
    parsed = playgroundSchema.safeParse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid request parameters" }, { status: 400 });
  }
  if (parsed.data.model !== publicPlaygroundModel) {
    return Response.json(
      { error: "Only the free model is available without an account." },
      { status: 400 },
    );
  }

  // 3. Forward to the provider (server-side; the key never reaches the browser).
  const providerKey = process.env.PROVIDER_PLAYGROUND_KEY;
  const url = playgroundProviderUrl();
  if (!providerKey || !url) {
    return Response.json(
      { error: "Playground is not configured. Please try again later.", remaining },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...parsed.data, stream: true }),
    });
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again.", remaining },
      { status: 500 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Sanitized error: never leak the provider's status or body.
    return Response.json(
      { error: "Model temporarily unavailable. Please try again.", remaining },
      { status: 503 },
    );
  }

  // 4. Stream SSE back, scrubbing the upstream cost object from every line.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Announce the remaining quota first; the client badge reads this.
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ meta: { remaining } })}\n`),
      );
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
