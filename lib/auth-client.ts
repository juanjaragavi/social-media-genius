/**
 * Social Media Genius — Auth Client Helpers
 *
 * Client-side authentication utilities for sign-in, sign-out, and session management.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Resolve the base URL for the auth client.
 *
 * In the browser we ALWAYS use window.location.origin so the client is
 * immune to NEXT_PUBLIC_APP_URL being set to localhost in Vercel env vars.
 * The env var fallback only matters during SSR (where window is undefined).
 */
function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3050";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;
