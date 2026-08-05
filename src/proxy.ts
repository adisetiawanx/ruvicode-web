import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly middleware in Next.js 15) — protects /dashboard routes.
 *
 * Placeholder for now (ADR-001). Real implementation with better-auth
 * session validation comes in the authentication ADR.
 */
export function proxy(_request: NextRequest) {
  void _request;
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
