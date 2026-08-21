import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 — formerly middleware) — handles route protection.
 *
 * - Protects /dashboard/* — redirects to /login if no session cookie
 * - Serves the app's branded 404 page to anonymous /super visitors
 */

// Paths that require authentication
const protectedPaths = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check session cookie presence (Better-auth sets this).
  // When BETTER_AUTH_URL is https, Better-auth prefixes the cookie with
  // __Secure-, so accept both names.
  const sessionToken =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Protect dashboard — redirect to login if no session
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /super must not reveal that it exists to anonymous visitors.
  // Rewrite to a path with no matching route so Next.js serves the app's
  // own branded not-found page with a 404 status (an empty 404 response
  // makes browsers render their ugly built-in error page instead).
  // The email allowlist still runs in the layout, the page, and
  // /api/admin/sweep for anyone who gets past this gate.
  if (pathname === "/super" || pathname.startsWith("/super/")) {
    if (!sessionToken) {
      return NextResponse.rewrite(
        new URL("/not-found-super", request.url),
      );
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
