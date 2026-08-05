import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware — protects /dashboard routes.
 *
 * Placeholder for now (ADR-001). Real implementation with better-auth
 * session validation comes in the authentication ADR.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
