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
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("better-auth.session_token");

  const { pathname } = request.nextUrl;

  // Define route types
  const isAuthAPIRoute = pathname.startsWith("/api/auth");
  const isLoginRoute = pathname === "/login";
  const isProtectedRoute =
    pathname === "/" || pathname.startsWith("/dashboard");

  // Never intercept auth API routes
  if (isAuthAPIRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
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
