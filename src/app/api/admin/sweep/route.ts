import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(email: string | null | undefined) {
  return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: { message: "Invalid request body" } }, { status: 400 });
  const input = body as Record<string, unknown>;
  const execute = input.execute === true;
  const previewId = typeof input.preview_id === "string" ? input.preview_id : undefined;
  const confirmation = typeof input.confirmation === "string" ? input.confirmation : undefined;
  if (Object.keys(input).some((key) => !["execute", "preview_id", "confirmation"].includes(key))) return Response.json({ error: { message: "Invalid request fields" } }, { status: 400 });
  if (execute && (!previewId || confirmation !== "SWEEP")) return Response.json({ error: { message: "A valid preview and confirmation are required" } }, { status: 400 });

  const gatewayUrl = (env.GATEWAY_INTERNAL_URL ?? env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
  if (!gatewayUrl || !env.INTERNAL_API_TOKEN) return Response.json({ error: { message: "Sweep is not configured" } }, { status: 503 });

  try {
    const upstream = await fetch(`${gatewayUrl}/internal/sweep`, {
      method: "POST",
      headers: {
        "X-Internal-Token": env.INTERNAL_API_TOKEN,
        "X-Admin-Actor": session.user.email,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ execute, preview_id: previewId ?? null, confirmation: execute ? confirmation : undefined }),
      signal: AbortSignal.timeout(120_000),
    });
    const responseBody = await upstream.text();
    return new Response(responseBody, { status: upstream.status, headers: { "Content-Type": "application/json", "X-Robots-Tag": "noindex, nofollow" } });
  } catch {
    return Response.json({ error: { message: "Gateway unreachable" } }, { status: 502 });
  }
}
