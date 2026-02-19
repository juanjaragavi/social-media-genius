/**
 * Social Media Genius — Proxy (formerly Middleware)
 *
 * Protects app routes behind authentication.
 * Public routes (auth API, content generation APIs) are exempt.
 *
 * Next.js 16 renamed middleware.ts to proxy.ts.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Better Auth prefixes cookies with __Secure- on HTTPS (production/staging).
  // On HTTP (localhost), the cookie name has no prefix.
  // Also check the session_data cookie (set when cookieCache is enabled) as a
  // fallback — if either token is present the user has an active session.
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_data") ||
    request.cookies.get("better-auth.session_data");

  const { pathname } = request.nextUrl;

  // Define route types
  const isAuthAPIRoute = pathname.startsWith("/api/auth");
  const isLoginRoute = pathname === "/login";
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/editor");

  // Never intercept auth API routes — they must pass through so the OAuth
  // callback can set cookies and issue redirects without interference.
  if (isAuthAPIRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (isLoginRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/generate|api/validate|api/ai-edit|api/upload).*)",
  ],
};
