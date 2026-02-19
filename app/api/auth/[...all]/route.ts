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
 * Wrap the Better Auth handler with error catching so 500s
 * surface a diagnostic message in the Vercel function logs.
 */
async function safeHandler(req: NextRequest) {
  try {
    const method = req.method as "GET" | "POST";
    const fn = method === "GET" ? handler.GET : handler.POST;
    if (!fn) {
      return NextResponse.json(
        { error: `Method ${method} not supported` },
        { status: 405 },
      );
    }
    return await fn(req);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown auth error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[SocialMediaGenius] Auth route error:", message, stack);
    return NextResponse.json(
      {
        error: "Internal auth error",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}

export const GET = safeHandler;
export const POST = safeHandler;
