/**
 * Temporary diagnostic endpoint — DELETE after debugging.
 *
 * Hit GET /api/auth-debug in the browser to see exactly what's
 * failing in the auth configuration on Vercel.
 */

import { Pool } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  // 1. Environment variable presence (values masked)
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
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID
      ? `✅ set (${process.env.GOOGLE_OAUTH_CLIENT_ID.slice(0, 12)}...)`
      : "❌ NOT SET",
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET
      ? "✅ set"
      : "❌ NOT SET",
  };

  // 2. Resolved baseURL
  const baseURL =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3050";
  diagnostics.resolvedBaseURL = baseURL;
  diagnostics.redirectURI = `${baseURL}/api/auth/callback/google`;

  // 3. Database connectivity - show which URL source is active
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
  diagnostics.supabaseDbUrlSet = process.env.SUPABASE_DB_URL
    ? `✅ set (${process.env.SUPABASE_DB_URL.replace(/:[^@]+@/, ":***@")})`
    : "❌ NOT SET — Vercel cannot reach Cloud SQL. Set SUPABASE_DB_URL to your Supabase pooler URI.";

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
    diagnostics.tablesExist =
      tables.rows.length >= 3
        ? "✅ Better Auth tables found"
        : `⚠️ Only ${tables.rows.length}/4 tables found — run migrations`;

    await pool.end();
  } catch (err: unknown) {
    diagnostics.database = {
      status: "❌ connection failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 4. Try importing auth to see if it throws
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

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
