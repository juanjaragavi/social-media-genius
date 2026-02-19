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

/**
 * Export Better Auth handlers directly so Set-Cookie headers, Location
 * redirects, and other response metadata pass through without modification.
 *
 * Previous implementation wrapped these in a safeHandler that replaced 5xx
 * responses with NextResponse.json(), which stripped the Set-Cookie headers
 * that the OAuth callback sets for the session token — causing authenticated
 * users to be redirected back to /login.
 */
export const { GET, POST } = toNextJsHandler(auth);
