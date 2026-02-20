/**
 * Temporary diagnostic: call Better Auth's internal API directly
 * to bypass HTTP and capture the real error. DELETE after debugging.
 *
 * Visit: https://social-media-genius.vercel.app/api/auth-test
 */

import { auth } from "@/lib/auth";
import { Pool } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const host = req.headers.get("host") || "social-media-genius.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseURL = `${protocol}://${host}`;

  const results: Record<string, unknown> = { baseURL };

  // Test 1: Direct internal API call to signInSocial
  try {
    const response = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: "/",
      },
      headers: new Headers({
        "Content-Type": "application/json",
        Origin: baseURL,
        Host: host,
      }),
    });
    results.directSignIn = {
      status: "success",
      url: response?.url,
      redirect: response?.redirect,
      data: response,
    };
  } catch (err: unknown) {
    results.directSignIn = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
      stack:
        err instanceof Error ? err.stack?.split("\n").slice(0, 10) : undefined,
      cause: err instanceof Error && err.cause ? String(err.cause) : undefined,
      raw: JSON.stringify(err, Object.getOwnPropertyNames(err as object)),
    };
  }

  // Test 2: Database schema check - verify columns match Better Auth expectations
  const databaseURL =
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
  try {
    const pool = new Pool({
      connectionString: databaseURL,
      connectionTimeoutMillis: 5000,
      ssl: databaseURL?.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
    });

    // Check user table columns
    const userCols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'user'
       ORDER BY ordinal_position`,
    );
    results.userTableColumns = userCols.rows;

    // Check account table columns
    const accountCols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'account'
       ORDER BY ordinal_position`,
    );
    results.accountTableColumns = accountCols.rows;

    // Check verification table columns
    const verificationCols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'verification'
       ORDER BY ordinal_position`,
    );
    results.verificationTableColumns = verificationCols.rows;

    // Check session table columns
    const sessionCols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'session'
       ORDER BY ordinal_position`,
    );
    results.sessionTableColumns = sessionCols.rows;
    // Check recent verification records (OAuth state tokens)
    const recentVerifications = await pool.query(
      `SELECT "id", "identifier", LEFT("value", 80) as "valuePreview",
              "expiresAt", "createdAt"
       FROM "verification"
       ORDER BY "createdAt" DESC NULLS LAST
       LIMIT 5`,
    );
    results.recentVerifications = recentVerifications.rows;

    // Check if any verification records exist at all
    const verificationCount = await pool.query(
      `SELECT COUNT(*) as total FROM "verification"`,
    );
    results.verificationCount = verificationCount.rows[0]?.total;

    // Check recent sessions
    const recentSessions = await pool.query(
      `SELECT "id", "userId", "expiresAt", "createdAt"
       FROM "session"
       ORDER BY "createdAt" DESC
       LIMIT 3`,
    );
    results.recentSessions = recentSessions.rows;

    // Check users
    const users = await pool.query(
      `SELECT "id", "email", "name", "createdAt"
       FROM "user"
       ORDER BY "createdAt" DESC
       LIMIT 5`,
    );
    results.users = users.rows;
    await pool.end();
  } catch (err: unknown) {
    results.schemaCheckError = err instanceof Error ? err.message : String(err);
  }

  // Test 3: Health check
  try {
    const okResponse = await fetch(`${baseURL}/api/auth/ok`);
    results.healthStatus = okResponse.status;
    const okText = await okResponse.text();
    try {
      results.healthBody = JSON.parse(okText);
    } catch {
      results.healthBody = okText.slice(0, 500);
    }
  } catch (err: unknown) {
    results.healthError = err instanceof Error ? err.message : String(err);
  }

  // Test 4: Auth config inspection
  results.authOptions = {
    baseURL: (auth.options as Record<string, unknown>)?.baseURL,
    socialProvidersConfigured: !!(auth.options as Record<string, unknown>)
      ?.socialProviders,
  };

  // Test 5: Validate Google OAuth credentials by calling Google's token endpoint
  // with a dummy code. Google will reply:
  //   - "invalid_client" → client_id or client_secret is wrong
  //   - "invalid_grant"  → credentials are valid, code is just fake (expected)
  //   - "redirect_uri_mismatch" → redirect_uri not registered
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const constructedRedirectUri = `${baseURL}/api/auth/callback/google`;

  results.oauthCredentials = {
    clientIdSet: !!clientId,
    clientIdFormat: clientId?.endsWith(".apps.googleusercontent.com")
      ? "valid"
      : "INVALID FORMAT",
    clientIdValue: clientId?.slice(0, 20) + "...",
    clientSecretSet: !!clientSecret,
    clientSecretLength: clientSecret?.length ?? 0,
    clientSecretPrefix: clientSecret?.slice(0, 7) ?? "(unset)",
    clientSecretHasWhitespace:
      clientSecret !== clientSecret?.trim()
        ? "YES — HAS LEADING/TRAILING WHITESPACE"
        : "clean",
    constructedRedirectUri,
  };

  try {
    const tokenTestParams = new URLSearchParams({
      code: "DUMMY_CODE_FOR_CREDENTIAL_VALIDATION",
      client_id: clientId || "",
      client_secret: clientSecret || "",
      redirect_uri: constructedRedirectUri,
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenTestParams.toString(),
    });
    const tokenBody = await tokenRes.json();
    results.googleTokenExchangeTest = {
      status: tokenRes.status,
      error: tokenBody.error,
      errorDescription: tokenBody.error_description,
      interpretation:
        tokenBody.error === "invalid_grant"
          ? "✅ Credentials are VALID (dummy code expected to fail with invalid_grant)"
          : tokenBody.error === "invalid_client"
            ? "❌ Client ID or Client Secret is WRONG"
            : tokenBody.error === "redirect_uri_mismatch"
              ? "❌ Redirect URI not registered in GCP Console"
              : `⚠️ Unexpected error: ${tokenBody.error}`,
    };
  } catch (err: unknown) {
    results.googleTokenExchangeTest = {
      error: "fetch_failed",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  // Test 6: Check BETTER_AUTH_SECRET consistency
  results.secretCheck = {
    betterAuthSecretSet: !!process.env.BETTER_AUTH_SECRET,
    authSecretSet: !!process.env.AUTH_SECRET,
    secretLength:
      (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET)?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
  };

  return NextResponse.json(results, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
