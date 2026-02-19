/**
 * Social Media Genius — Better Auth API Route Handler
 *
 * Catch-all route that handles all Better Auth endpoints:
 * - /api/auth/sign-in/*
 * - /api/auth/sign-out
 * - /api/auth/callback/*
 * - /api/auth/session
 * etc.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const { GET: _GET, POST: _POST } = toNextJsHandler(auth);

/**
 * Thin wrapper that:
 *   1. Passes the response through UNMODIFIED (preserving Set-Cookie, 302, etc.)
 *   2. Logs errors server-side so Vercel function logs show what actually failed
 *
 * We intentionally do NOT replace or re-create the response — doing so was
 * the prior cause of stripped Set-Cookie headers.
 */
async function withLogging(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest,
): Promise<Response> {
  try {
    const res = await handler(req);
    if (res.status >= 500) {
      // Clone to read the body without consuming the original response stream
      const clone = res.clone();
      const body = await clone.text().catch(() => "(unreadable)");
      console.error(
        `[Auth] ${req.method} ${req.nextUrl.pathname} → ${res.status}:`,
        body.slice(0, 500),
      );
    }
    // Return the ORIGINAL response — headers, cookies, status intact
    return res;
  } catch (err: unknown) {
    console.error(
      "[Auth] Unhandled:",
      err instanceof Error ? err.message : String(err),
    );
    throw err; // Re-throw so Next.js returns its native 500
  }
}

export async function GET(req: NextRequest) {
  return withLogging(_GET, req);
}

export async function POST(req: NextRequest) {
  return withLogging(_POST, req);
}
