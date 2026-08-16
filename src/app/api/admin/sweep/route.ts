import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin sweep proxy.
 *
 * The browser never talks to the gateway directly and the internal token
 * never leaves the server. Same admin gate as /super: a session whose
 * email is on the ADMIN_EMAILS allowlist. Everyone else gets a 404 so
 * the endpoint's existence stays invisible.
 */
export async function POST(req: NextRequest) {
  // 1. Admin gate (same rule as the /super page).
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes((session.user.email ?? "").toLowerCase())) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // 2. Validate the body: only the execute flag is accepted.
  let execute = false;
  try {
    const body = await req.json();
    execute = body?.execute === true;
  } catch {
    // Empty or invalid body defaults to a dry-run preview.
  }

  // 3. Forward to the gateway's internal endpoint (server-to-server).
  const gatewayUrl = (
    env.GATEWAY_INTERNAL_URL ?? env.NEXT_PUBLIC_API_URL ?? ""
  ).replace(/\/+$/, "");
  const token = env.INTERNAL_API_TOKEN;
  if (!gatewayUrl || !token) {
    return Response.json(
      { error: "Sweep is not configured. Please try again later." },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl}/internal/sweep`, {
      method: "POST",
      headers: {
        "X-Internal-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ execute }),
      // A full sweep round (gas funding + 1 block wait + transfers) can
      // take a while with many addresses; do not cut it off early.
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return Response.json(
      { error: "Gateway unreachable. Please try again." },
      { status: 502 },
    );
  }

  // 4. Pass the gateway's reply through unchanged.
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
