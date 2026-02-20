/**
 * Diagnostic endpoint for auth configuration.
 *
 * Hit GET /api/auth-debug in the browser to see exactly what's
 * failing in the auth configuration locally or on Vercel.
 *
 * DELETE after debugging. Do not deploy to production.
 */

import { Pool } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  // ─── 1. Environment variable presence (values masked) ──────────────
  diagnostics.env = {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
      ? `✅ set (${process.env.BETTER_AUTH_URL})`
      : "❌ NOT SET",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET
      ? `✅ set (${process.env.BETTER_AUTH_SECRET.slice(0, 6)}...)`
      : "❌ NOT SET",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
      ? `✅ set (${process.env.NEXT_PUBLIC_APP_URL})`
      : "❌ NOT SET",
    VERCEL_URL: process.env.VERCEL_URL
      ? `✅ set (${process.env.VERCEL_URL})`
      : "❌ NOT SET",
    VERCEL: process.env.VERCEL ?? "NOT SET",
    NODE_ENV: process.env.NODE_ENV ?? "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL
      ? `✅ set (${process.env.DATABASE_URL.replace(/:[^@]+@/, ":***@")})`
      : "❌ NOT SET",
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
      ? `✅ set (${process.env.SUPABASE_DB_URL.replace(/:[^@]+@/, ":***@")})`
      : "❌ NOT SET",
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID
      ? `✅ set (${process.env.GOOGLE_OAUTH_CLIENT_ID.slice(0, 20)}...)`
      : "❌ NOT SET",
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET
      ? "✅ set"
      : "❌ NOT SET",
  };

  // ─── 2. Resolved baseURL + callback URI ────────────────────────────
  const baseURL =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3050";

  const callbackURI = `${baseURL}/api/auth/callback/google`;

  diagnostics.resolvedBaseURL = baseURL;
  diagnostics.callbackURI = {
    value: callbackURI,
    instruction:
      "This EXACT URI must be registered as an Authorized Redirect URI " +
      "in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client. " +
      "A mismatch causes the 'invalid_code' error.",
  };

  // ─── 3. Google Cloud Console checklist ─────────────────────────────
  diagnostics.googleCloudConsoleChecklist = {
    step1: "Go to https://console.cloud.google.com/apis/credentials",
    step2:
      "Click the OAuth 2.0 Client ID used by this app " +
      `(starts with ${process.env.GOOGLE_OAUTH_CLIENT_ID?.slice(0, 12) ?? "???"}...)`,
    step3_authorizedRedirectURIs: [
      callbackURI,
      ...(baseURL.includes("localhost")
        ? [
            "https://social.topnetworks.co/api/auth/callback/google",
            "https://social-media-genius.vercel.app/api/auth/callback/google",
          ]
        : ["http://localhost:3050/api/auth/callback/google"]),
    ],
    note: "All URIs above must be present. Missing entries cause 'invalid_code'.",
  };

  // ─── 4. Client ID consistency check ────────────────────────────────
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID ?? "";
  const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID ?? "";
  const publicDriveClientId =
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ?? "";

  diagnostics.clientIdConsistency = {
    GOOGLE_OAUTH_CLIENT_ID: oauthClientId
      ? `${oauthClientId.slice(0, 20)}... (len=${oauthClientId.length})`
      : "❌ NOT SET",
    GOOGLE_DRIVE_CLIENT_ID: driveClientId
      ? `${driveClientId.slice(0, 20)}... (len=${driveClientId.length})`
      : "❌ NOT SET",
    NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID: publicDriveClientId
      ? `${publicDriveClientId.slice(0, 20)}... (len=${publicDriveClientId.length})`
      : "❌ NOT SET",
    oauthMatchesDrive:
      oauthClientId === driveClientId ? "✅ match" : "⚠️ DIFFERENT",
    oauthMatchesPublicDrive:
      oauthClientId === publicDriveClientId ? "✅ match" : "⚠️ DIFFERENT",
    note:
      oauthClientId !== driveClientId
        ? "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_DRIVE_CLIENT_ID are different. " +
          "If they should be the same OAuth client, fix the mismatch. " +
          "The shared client secret suggests one ID has a typo."
        : "All client IDs match.",
  };

  // ─── 5. Database connectivity ──────────────────────────────────────
  const dbSource = process.env.SUPABASE_DB_URL
    ? "SUPABASE_DB_URL"
    : process.env.POSTGRES_URL
      ? "POSTGRES_URL"
      : "DATABASE_URL";
  const dbURL =
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  diagnostics.databaseSource = dbSource;

  try {
    const pool = new Pool({
      connectionString: dbURL,
      connectionTimeoutMillis: 5000,
      ssl: dbURL?.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    const result = await pool.query("SELECT NOW() AS server_time");
    diagnostics.database = {
      status: "✅ connected",
      serverTime: result.rows[0]?.server_time,
    };

    // Check if Better Auth tables exist
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('user', 'session', 'account', 'verification')
       ORDER BY table_name`,
    );
    diagnostics.betterAuthTables = tables.rows.map(
      (r: { table_name: string }) => r.table_name,
    );

    const hasVerification = tables.rows.some(
      (r: { table_name: string }) => r.table_name === "verification",
    );
    diagnostics.tablesExist =
      tables.rows.length >= 3
        ? "✅ Better Auth tables found"
        : `⚠️ Only ${tables.rows.length}/4 tables found — run migrations`;
    diagnostics.verificationTable = hasVerification
      ? "✅ present (required for OAuth state storage)"
      : "❌ MISSING — OAuth will fail with 'please_restart_the_process'";

    // Check for stale verifications (possible indicator of repeated failed attempts)
    if (hasVerification) {
      const stale = await pool.query(
        `SELECT COUNT(*) AS count FROM verification 
         WHERE "expiresAt" < NOW()`,
      );
      const staleCount = parseInt(stale.rows[0]?.count ?? "0", 10);
      diagnostics.staleVerifications =
        staleCount > 10
          ? `⚠️ ${staleCount} expired verifications — indicates repeated failed OAuth attempts`
          : `✅ ${staleCount} expired (normal)`;
    }

    await pool.end();
  } catch (err: unknown) {
    diagnostics.database = {
      status: "❌ connection failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // ─── 6. Auth module import test ────────────────────────────────────
  try {
    const { auth } = await import("@/lib/auth");
    diagnostics.authImport = "✅ auth module loaded successfully";
    diagnostics.authBaseURL = (auth.options as { baseURL?: string })?.baseURL;
  } catch (err: unknown) {
    diagnostics.authImport = {
      status: "❌ auth module failed to load",
      error: err instanceof Error ? err.message : String(err),
      stack:
        err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
    };
  }

  // ─── 7. Quick token endpoint reachability check ────────────────────
  try {
    const tokenCheck = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: "DIAGNOSTIC_TEST_CODE",
        redirect_uri: callbackURI,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
      }),
    });
    const tokenBody = await tokenCheck.json();
    // We expect an error — the code is fake. But the error TYPE tells us
    // whether the client_id/redirect_uri are registered.
    diagnostics.googleTokenEndpoint = {
      reachable: "✅ yes",
      expectedError: tokenBody.error,
      errorDescription: tokenBody.error_description,
      interpretation:
        tokenBody.error === "invalid_grant"
          ? "✅ Client ID and redirect URI are recognized by Google. The 'invalid_grant' " +
            "is expected for our fake test code."
          : tokenBody.error === "redirect_uri_mismatch"
            ? `❌ REDIRECT URI MISMATCH — Google does not recognize '${callbackURI}' ` +
              "as a registered redirect URI for this client. Add it in Google Cloud Console."
            : tokenBody.error === "invalid_client"
              ? "❌ INVALID CLIENT — The GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET " +
                "is wrong, or the client has been deleted."
              : `⚠️ Unexpected error: ${tokenBody.error} — ${tokenBody.error_description}`,
    };
  } catch (err: unknown) {
    diagnostics.googleTokenEndpoint = {
      reachable: "❌ cannot reach Google's token endpoint",
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
