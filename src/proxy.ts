import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 — formerly middleware) — handles route protection.
 *
 * - Protects /dashboard/* — redirects to /login if no session cookie
 * - Redirects authenticated users away from /login and /register
 */

// Paths that require authentication
const protectedPaths = ["/dashboard"];

// Paths that should NOT be accessible when logged in
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check session cookie presence (Better-auth sets this).
  // When BETTER_AUTH_URL is https, Better-auth prefixes the cookie with
  // __Secure-, so accept both names.
  const sessionToken =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  // Protect dashboard — redirect to login if no session
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /super must not reveal that it exists. Anonymous scanners get a
  // hard 404 before any render: Next streams the document head (with a
  // 200 status) before the layout's async allowlist check can call
  // notFound(). Cookie presence is the coarse gate only; the email
  // allowlist still runs in the layout, the page, and /api/admin/sweep.
  if (pathname === "/super" || pathname.startsWith("/super/")) {
    if (!sessionToken) {
      return new NextResponse(null, { status: 404 });
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
