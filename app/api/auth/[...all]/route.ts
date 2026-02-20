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
 * Resolve the expected callback URI for diagnostic logging.
 * This must match EXACTLY what is registered in Google Cloud Console.
 */
function getExpectedCallbackURI(): string {
  const baseURL =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3050";
  return `${baseURL}/api/auth/callback/google`;
}

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
    const hasCode = url.searchParams.has("code");
    const hasError = url.searchParams.get("error");
    const hasState = url.searchParams.has("state");

    console.log(
      `[Auth] 📥 Callback received: ${pathname}`,
      `| state=${hasState ? url.searchParams.get("state")?.slice(0, 12) + "..." : "MISSING"}`,
      `| code=${hasCode ? "present" : "MISSING"}`,
      `| error=${hasError || "none"}`,
    );

    // Log the expected callback URI for easy comparison with Google Cloud Console
    console.log(
      `[Auth] 🔗 Expected redirect URI (must match Google Cloud Console):`,
      getExpectedCallbackURI(),
    );

    // Log cookie presence — PKCE state relies on cookies
    const cookies = req.headers.get("cookie") || "";
    const hasStateCookie =
      cookies.includes("better-auth.state") ||
      cookies.includes("better-auth.oauth_state") ||
      cookies.includes("__Secure-better-auth");
    console.log(
      `[Auth] 🍪 Auth cookies present: ${hasStateCookie ? "yes" : "NO — state verification will fail"}`,
      `| cookie header length: ${cookies.length}`,
    );
  }

  try {
    const res = await handler(req);

    // Log any non-2xx response with body details
    if (res.status >= 400) {
      const clone = res.clone();
      const body = await clone.text().catch(() => "(unreadable)");
      console.error(
        `[Auth] ❌ ${req.method} ${pathname} → ${res.status}:`,
        body.slice(0, 1000),
      );

      // For callbacks that redirect to errorCallbackURL, log the redirect target
      const location = res.headers.get("location");
      if (location) {
        console.error(`[Auth] ❌ Redirect target: ${location}`);
      }
    }

    // Also log redirect responses from callbacks (302s) — these carry the error
    if (isCallback && (res.status === 302 || res.status === 307)) {
      const location = res.headers.get("location");
      const isError = location?.includes("error=");
      console.log(
        `[Auth] ${isError ? "❌" : "✅"} Callback redirect → ${res.status}: ${location?.slice(0, 200)}`,
      );

      // If the redirect contains invalid_code, log detailed troubleshooting hints
      if (location?.includes("invalid_code")) {
        const expectedURI = getExpectedCallbackURI();
        console.error(
          `[Auth] 🔍 TROUBLESHOOTING invalid_code:\n` +
            `  1. Verify this EXACT URI is registered in Google Cloud Console → Credentials → OAuth 2.0 Client:\n` +
            `     ${expectedURI}\n` +
            `  2. Verify GOOGLE_OAUTH_CLIENT_ID matches the client with that redirect URI.\n` +
            `     Current: ${process.env.GOOGLE_OAUTH_CLIENT_ID?.slice(0, 20)}...\n` +
            `  3. Verify GOOGLE_OAUTH_CLIENT_SECRET matches the same client.\n` +
            `  4. Clear browser cookies for localhost:3050 and retry.\n` +
            `  5. Check Google's response in the server logs above for the actual rejection reason.`,
        );
      }
    }

    // Return the ORIGINAL response — headers, cookies, status intact
    return res;
  } catch (err: unknown) {
    console.error(
      "[Auth] ❗ Unhandled:",
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
