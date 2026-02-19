-- ============================================================
-- Social Media Genius — Better Auth + Rate Limiting Migration
-- ============================================================
-- Run this in Supabase SQL Editor AFTER the base schema (schema.sql).
-- This creates the tables required by Better Auth and the rate
-- limiting function used by lib/rate-limit.ts.
-- ============================================================

-- ───────────────────────────────────────────────────────────────
-- 1. Better Auth Tables
-- ───────────────────────────────────────────────────────────────
-- Better Auth auto-creates these if missing, but defining them
-- explicitly gives us full control over RLS and indexes.

CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Indexes for Better Auth tables
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- ───────────────────────────────────────────────────────────────
-- 2. Rate Limiting
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limits (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1,
    UNIQUE(key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Sliding-window rate limiter function.
-- Returns TRUE if the request is allowed, FALSE if rate-limited.
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key TEXT,
    p_window_seconds INTEGER DEFAULT 10,
    p_max_requests INTEGER DEFAULT 100
) RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_count INTEGER;
BEGIN
    v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

    -- Count requests in the current window
    SELECT COALESCE(SUM(request_count), 0)
    INTO v_count
    FROM rate_limits
    WHERE key = p_key
      AND window_start >= v_window_start;

    -- If under limit, record the request and allow
    IF v_count < p_max_requests THEN
        INSERT INTO rate_limits (key, window_start, request_count)
        VALUES (p_key, date_trunc('second', NOW()), 1)
        ON CONFLICT (key, window_start)
        DO UPDATE SET request_count = rate_limits.request_count + 1;
        RETURN TRUE;
    END IF;

    -- Over limit
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old rate limit entries (run periodically or via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- 3. Add user_id to generated_posts (optional, for multi-user)
-- ───────────────────────────────────────────────────────────────

ALTER TABLE generated_posts
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON generated_posts(user_id);
