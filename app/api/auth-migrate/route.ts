/**
 * One-time migration: recreate Better Auth tables with correct camelCase schema.
 *
 * Visit: https://social-media-genius.vercel.app/api/auth-migrate
 *
 * The existing tables use snake_case columns (NextAuth convention).
 * Better Auth expects camelCase columns. This drops and recreates them.
 *
 * DELETE THIS FILE after migration is complete.
 */

import { Pool } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIGRATION_SQL = `
-- =============================================================
-- Better Auth Schema Migration (snake_case → camelCase)
-- =============================================================

-- Drop existing tables with wrong column naming
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Recreate with Better Auth expected schema (camelCase columns)
CREATE TABLE "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_account_providerId" ON "account"("providerId");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user"("email");
`;

export async function GET() {
  const databaseURL =
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  if (!databaseURL) {
    return NextResponse.json(
      { error: "No database URL configured" },
      { status: 500 },
    );
  }

  const pool = new Pool({
    connectionString: databaseURL,
    connectionTimeoutMillis: 10000,
    ssl: databaseURL.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    // Run the migration
    await pool.query(MIGRATION_SQL);

    // Verify the new schema
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('user', 'session', 'account', 'verification')
       ORDER BY table_name`,
    );

    const verificationCols = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'verification'
       ORDER BY ordinal_position`,
    );

    await pool.end();

    return NextResponse.json({
      status: "✅ Migration completed successfully",
      tablesCreated: tables.rows.map(
        (r: { table_name: string }) => r.table_name,
      ),
      verificationColumns: verificationCols.rows.map(
        (r: { column_name: string }) => r.column_name,
      ),
      message:
        "Better Auth tables recreated with camelCase columns. Try signing in now.",
    });
  } catch (err: unknown) {
    await pool.end();
    return NextResponse.json(
      {
        status: "❌ Migration failed",
        error: err instanceof Error ? err.message : String(err),
        stack:
          err instanceof Error
            ? err.stack?.split("\n").slice(0, 5)
            : undefined,
      },
      { status: 500 },
    );
  }
}
