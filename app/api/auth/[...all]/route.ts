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
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

/**
 * Wrap the Better Auth handler with diagnostics.
 * If Better Auth returns a 500, clone the response, read the body,
 * and log it so the actual error is visible in Vercel function logs.
 */
async function safeHandler(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log(`[Auth] ${req.method} ${pathname}`);

  try {
    const method = req.method as "GET" | "POST";
    const fn = method === "GET" ? handler.GET : handler.POST;
    if (!fn) {
      return NextResponse.json(
        { error: `Method ${method} not supported` },
        { status: 405 },
      );
    }

    const response = await fn(req);

    // If Better Auth returned a 4xx/5xx, log the body for debugging
    if (response.status >= 400) {
      const cloned = response.clone();
      try {
        const body = await cloned.text();
        console.error(
          `[Auth] ${req.method} ${pathname} → ${response.status}:`,
          body,
        );
        // Temporarily return the actual error in the response for debugging
        if (response.status >= 500) {
          return NextResponse.json(
            {
              error: "Better Auth internal error",
              status: response.status,
              detail: body,
              url: pathname,
            },
            { status: response.status },
          );
        }
      } catch {
        console.error(
          `[Auth] ${req.method} ${pathname} → ${response.status} (could not read body)`,
        );
      }
    }

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown auth error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Auth] Unhandled exception:", message, stack);
    return NextResponse.json(
      {
        error: "Unhandled auth exception",
        message,
        stack: stack?.split("\n").slice(0, 8),
      },
      { status: 500 },
    );
  }
}

export const GET = safeHandler;
export const POST = safeHandler;
