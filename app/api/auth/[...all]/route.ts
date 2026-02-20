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
  const pathname = req.nextUrl.pathname;
  const isCallback = pathname.includes("/callback/");

  // Log callback requests with extra detail — this is where invalid_code fails
  if (isCallback) {
    const url = new URL(req.url);
    console.log(
      `[Auth] Callback received: ${pathname}`,
      `| state=${url.searchParams.get("state")?.slice(0, 12)}...`,
      `| code=${url.searchParams.has("code") ? "present" : "MISSING"}`,
      `| error=${url.searchParams.get("error") || "none"}`,
    );
  }

  try {
    const res = await handler(req);

    // Log any non-2xx response with body details
    if (res.status >= 400) {
      const clone = res.clone();
      const body = await clone.text().catch(() => "(unreadable)");
      console.error(
        `[Auth] ${req.method} ${pathname} → ${res.status}:`,
        body.slice(0, 1000),
      );

      // For callbacks that redirect to errorCallbackURL, log the redirect target
      const location = res.headers.get("location");
      if (location) {
        console.error(`[Auth] Redirect target: ${location}`);
      }
    }

    // Also log redirect responses from callbacks (302s) — these carry the error
    if (isCallback && (res.status === 302 || res.status === 307)) {
      const location = res.headers.get("location");
      console.log(
        `[Auth] Callback redirect → ${res.status}: ${location?.slice(0, 200)}`,
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
