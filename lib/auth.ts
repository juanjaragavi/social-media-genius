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
 * Priority: BETTER_AUTH_URL > NEXT_PUBLIC_APP_URL > localhost fallback.
 */
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3050";

/**
 * Trusted origins that Better Auth will accept requests from.
 * This prevents CSRF while allowing our deployment tiers.
 */
const trustedOrigins = [
  "http://localhost:3050", // Local development
  "https://social-media-genius.vercel.app", // Staging / Preview
  "https://social.topnetworks.co", // Production
].filter(Boolean);

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
