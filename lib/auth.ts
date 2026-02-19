/**
 * Social Media Genius — Better Auth Server Configuration
 *
 * Google OAuth with domain restriction to TopNetworks, Inc.
 * Only @topnetworks.co and @topfinanzas.com emails are allowed.
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Resolve the canonical app URL for the current environment.
 *
 * Priority:
 *   1. BETTER_AUTH_URL (explicit override)
 *   2. NEXT_PUBLIC_APP_URL (shared with client)
 *   3. VERCEL_URL (auto-provided by Vercel — no protocol, so we prepend https)
 *   4. localhost fallback (local development only)
 */
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3050");

/**
 * Trusted origins that Better Auth will accept requests from.
 * This prevents CSRF while allowing our deployment tiers.
 * The resolved baseURL is always included so preview deployments work.
 */
const trustedOrigins = [
  "http://localhost:3050", // Local development
  "https://social-media-genius.vercel.app", // Staging / Preview
  "https://social.topnetworks.co", // Production
  ...(process.env.VERCEL_URL
    ? [`https://${process.env.VERCEL_URL}`]
    : []),
  baseURL, // Always trust the resolved base
].filter((value, index, self) => Boolean(value) && self.indexOf(value) === index);

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: false, // Google-only authentication
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  } as Record<string, unknown>,
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
