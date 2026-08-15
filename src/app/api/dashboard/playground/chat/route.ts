import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getApiKeys } from "@/lib/db/queries/management";
import { env } from "@/lib/env";
import {
  playgroundSchema,
  sanitizeSSELine,
  displayModelName,
} from "@/lib/playground";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dashboard playground chat route.
 *
 * Signed-in users play with their own API key: the route picks the first
 * active key and calls the gateway's internal playground endpoint, which
 * applies the key's rate and spend limits and bills the user's wallet. The
 * full key never reaches the web server or the browser. The gateway response
 * is already masked, and the upstream cost object is stripped again here as
 * a second layer.
 */
export async function POST(req: NextRequest) {
  // 1. Session gate.
  const session = await getSession();
  if (!session) {
    return Response.json(
      { error: "Sign in to use the playground." },
      { status: 401 },
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

  // 3. Pick the user's first active key; if none, ask them to create one.
  const keys = await getApiKeys(session.user.id);
  const key = keys[0];
  if (!key) {
    return Response.json(
      {
        error: "No active API key. Create one in the dashboard first.",
        code: "no_active_key",
      },
      { status: 400 },
    );
  }

  // 4. Call the gateway's internal endpoint (server-to-server, shared token).
  // Inside Docker the public api host does not resolve; prefer the
  // internal service URL when set (docker compose), else the public one.
  const gatewayUrl = (env.GATEWAY_INTERNAL_URL ?? env.NEXT_PUBLIC_API_URL).replace(/\/+$/, "");
  const token = env.INTERNAL_API_TOKEN;
  if (!gatewayUrl || !token) {
    return Response.json(
      { error: "Playground is not configured. Please try again later." },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl}/internal/playground/chat`, {
      method: "POST",
      headers: {
        "X-Internal-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: session.user.id,
        key_id: key.id,
        ...parsed.data,
        // Identity context added server-side so self-identification matches
        // the catalog; browser payloads stay clean.
        messages: [
          {
            role: "system",
            content: `Context: this conversation runs on Ruvicode, an API gateway. The model serving it is ${displayModelName(parsed.data.model)}. Answer in your usual voice; if the user asks which model they are talking to, just say ${displayModelName(parsed.data.model)}.`,
          },
          ...parsed.data.messages,
        ],
        stream: true,
      }),
    });
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Forward the gateway's sanitized error message (OpenAI-shaped).
    let message = "Model temporarily unavailable. Please try again.";
    let code: string | undefined;
    try {
      const body = (await upstream.json()) as {
        error?: { message?: string };
      };
      if (body.error?.message) message = body.error.message;
      if (upstream.status === 400 && message.includes("Create one in the dashboard")) {
        code = "no_active_key";
      }
    } catch {
      // Non-JSON upstream error; keep the generic message.
    }
    return Response.json({ error: message, code }, { status: upstream.status });
  }

  // 5. Stream the gateway's SSE back to the browser.
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
            // Second masking layer: the gateway stream is already scrubbed,
            // but drop comments and re-scrub defensively here.
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
        controller.error(new Error("gateway stream interrupted"));
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
