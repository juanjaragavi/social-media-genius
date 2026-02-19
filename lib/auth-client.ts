/**
 * Social Media Genius — Auth Client Helpers
 *
 * Client-side authentication utilities for sign-in, sign-out, and session management.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Resolve the base URL for the auth client.
 *
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL (set explicitly per Vercel environment)
 *   2. Browser origin (runtime detection — works on any deployment)
 *   3. localhost fallback (only hit during SSR in local development)
 */
const resolveBaseURL = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3050";
};

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;
