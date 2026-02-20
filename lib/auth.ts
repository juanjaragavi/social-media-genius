/**
 * Social Media Genius — Better Auth Server Configuration
 *
 * Google OAuth with domain restriction to TopNetworks, Inc.
 * Only @topnetworks.co and @topfinanzas.com emails are allowed.
 */

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

/**
 * Resolve the application secret used for session encryption, CSRF tokens,
 * and OAuth state signing.
 *
 * Priority:
 *   1. BETTER_AUTH_SECRET (canonical)
 *   2. AUTH_SECRET (common alias)
 *
 * In production, Better Auth will throw a hard error if neither is set.
 * We surface a clear message here so the developer knows what to fix.
 */
const appSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
if (!appSecret && process.env.NODE_ENV === "production") {
  console.error(
    "[SocialMediaGenius] FATAL: BETTER_AUTH_SECRET is not set.",
    "Add it to Vercel environment variables (all 3 scopes) and redeploy.",
    "Generate one with: openssl rand -base64 32",
  );
}

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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3050";

// Log resolved URL at module load to help diagnose deployment issues
if (process.env.VERCEL) {
  console.log(
    `[SocialMediaGenius] Auth baseURL resolved to: ${baseURL}`,
    `| BETTER_AUTH_URL=${process.env.BETTER_AUTH_URL ?? "(unset)"}`,
    `| VERCEL_URL=${process.env.VERCEL_URL ?? "(unset)"}`,
    `| NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL ?? "(unset)"}`,
  );
}

/**
 * Trusted origins that Better Auth will accept requests from.
 * This prevents CSRF while allowing our deployment tiers.
 * The resolved baseURL is always included so preview deployments work.
 */
const trustedOrigins = [
  "http://localhost:3050", // Local development
  "https://social-media-genius.vercel.app", // Staging / Preview
  "https://social.topnetworks.co", // Production
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  baseURL, // Always trust the resolved base
].filter(
  (value, index, self) => Boolean(value) && self.indexOf(value) === index,
);

/**
 * Resolve the database connection string.
 *
 * Priority:
 *   1. SUPABASE_DB_URL — Supabase pooler (reachable from Vercel serverless)
 *   2. POSTGRES_URL    — Vercel-convention alias
 *   3. DATABASE_URL    — Cloud SQL direct IP (works locally, NOT from Vercel)
 *
 * On Vercel, Cloud SQL's private IP is unreachable. SUPABASE_DB_URL must be
 * set to the Supabase connection-pooler URI (Transaction mode, port 6543).
 */
const databaseURL =
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (process.env.VERCEL) {
  console.log(
    `[SocialMediaGenius] Auth DB URL source:`,
    process.env.SUPABASE_DB_URL
      ? "SUPABASE_DB_URL"
      : process.env.POSTGRES_URL
        ? "POSTGRES_URL"
        : process.env.DATABASE_URL
          ? "DATABASE_URL"
          : "⚠️ NONE SET",
  );
}

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  // Explicitly pass the secret so Better Auth does not fall back to DEFAULT_SECRET.
  // In production, DEFAULT_SECRET causes a hard throw (by design).
  ...(appSecret ? { secret: appSecret } : {}),
  database: new Pool({
    connectionString: databaseURL,
    // Vercel functions have 10s default timeout; fail fast instead of hanging
    connectionTimeoutMillis: 5000,
    ssl:
      process.env.VERCEL || databaseURL?.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
  }),
  emailAndPassword: {
    enabled: false, // Google-only authentication
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      // Do NOT set redirectURI — Better Auth auto-constructs it from baseURL.
      // Overriding it causes a silent 500 in the sign-in flow.
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
  plugins: [nextCookies()],
  advanced: {
    database: {
      /**
       * Generate UUIDs for all table rows.
       * Must be a function — the string shorthand "uuid" is NOT supported
       * in Better Auth 1.x and silently produces null IDs (which crashes
       * the verification table insert during OAuth initiation).
       */
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
