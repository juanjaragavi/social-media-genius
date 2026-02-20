-- ============================================================
-- Social Media Genius — Row Level Security (RLS) Migration
-- ============================================================
-- Run this in Supabase SQL Editor AFTER 001-auth-and-rate-limiting.sql.
--
-- Since this app uses Better Auth (not Supabase Auth), auth.uid()
-- is NOT available. Instead, the application sets a per-transaction
-- session variable `app.current_user_id` before every query.
--
-- RLS policies reference: current_setting('app.current_user_id', true)
-- The second argument (true) means "return NULL if missing" so
-- queries without the variable set simply return no rows (safe default).
-- ============================================================

-- ───────────────────────────────────────────────────────────────
-- 1. Add user_id columns to tables that lack them
-- ───────────────────────────────────────────────────────────────

-- generated_posts already has user_id from migration 001.
-- Add it to generated_images, generated_videos, and usage_analytics.

ALTER TABLE generated_images
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE generated_videos
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE usage_analytics
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;

-- Indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON usage_analytics(user_id);


-- ───────────────────────────────────────────────────────────────
-- 2. Helper function: get the current app user ID
-- ───────────────────────────────────────────────────────────────
-- Returns the user ID set by the application via:
--   SET LOCAL app.current_user_id = '<user_id>';
-- Returns NULL if not set (which makes all RLS checks fail → no rows).

CREATE OR REPLACE FUNCTION app_user_id() RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ───────────────────────────────────────────────────────────────
-- 3. Enable RLS on all user-scoped tables
-- ───────────────────────────────────────────────────────────────

ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────────
-- 4. RLS Policies — generated_posts
-- ───────────────────────────────────────────────────────────────

-- Users can only SELECT their own posts
CREATE POLICY posts_select_own ON generated_posts
    FOR SELECT
    USING (user_id = app_user_id());

-- Users can only INSERT posts they own
CREATE POLICY posts_insert_own ON generated_posts
    FOR INSERT
    WITH CHECK (user_id = app_user_id());

-- Users can only UPDATE their own posts
CREATE POLICY posts_update_own ON generated_posts
    FOR UPDATE
    USING (user_id = app_user_id())
    WITH CHECK (user_id = app_user_id());

-- Users can only DELETE their own posts
CREATE POLICY posts_delete_own ON generated_posts
    FOR DELETE
    USING (user_id = app_user_id());


-- ───────────────────────────────────────────────────────────────
-- 5. RLS Policies — generated_images
-- ───────────────────────────────────────────────────────────────

CREATE POLICY images_select_own ON generated_images
    FOR SELECT
    USING (user_id = app_user_id());

CREATE POLICY images_insert_own ON generated_images
    FOR INSERT
    WITH CHECK (user_id = app_user_id());

CREATE POLICY images_update_own ON generated_images
    FOR UPDATE
    USING (user_id = app_user_id())
    WITH CHECK (user_id = app_user_id());

CREATE POLICY images_delete_own ON generated_images
    FOR DELETE
    USING (user_id = app_user_id());


-- ───────────────────────────────────────────────────────────────
-- 6. RLS Policies — generated_videos
-- ───────────────────────────────────────────────────────────────

CREATE POLICY videos_select_own ON generated_videos
    FOR SELECT
    USING (user_id = app_user_id());

CREATE POLICY videos_insert_own ON generated_videos
    FOR INSERT
    WITH CHECK (user_id = app_user_id());

CREATE POLICY videos_update_own ON generated_videos
    FOR UPDATE
    USING (user_id = app_user_id())
    WITH CHECK (user_id = app_user_id());

CREATE POLICY videos_delete_own ON generated_videos
    FOR DELETE
    USING (user_id = app_user_id());


-- ───────────────────────────────────────────────────────────────
-- 7. RLS Policies — usage_analytics
-- ───────────────────────────────────────────────────────────────

CREATE POLICY analytics_select_own ON usage_analytics
    FOR SELECT
    USING (user_id = app_user_id());

CREATE POLICY analytics_insert_own ON usage_analytics
    FOR INSERT
    WITH CHECK (user_id = app_user_id());

-- No UPDATE/DELETE on analytics — immutable audit log


-- ───────────────────────────────────────────────────────────────
-- 8. Service role bypass
-- ───────────────────────────────────────────────────────────────
-- The Supabase service_role key bypasses RLS by default.
-- Rate-limit operations and admin tasks use the service role.
-- Better Auth's own tables (user, session, account, verification)
-- are managed by the library and don't need app-level RLS.

-- NOTE: If using a standard PostgreSQL role (not Supabase service_role)
-- for the application connection, you may need to GRANT the app role
-- permission to set the app.current_user_id variable:
--
--   ALTER ROLE your_app_role SET app.current_user_id TO '';
--
-- With Supabase, the service_role already has superuser-like permissions.


-- ───────────────────────────────────────────────────────────────
-- 9. Recreate views to respect RLS
-- ───────────────────────────────────────────────────────────────
-- Views inherit the invoker's RLS context, so they automatically
-- filter by user_id when the session variable is set.

DROP VIEW IF EXISTS recent_activity;
CREATE VIEW recent_activity AS
SELECT
    p.id,
    p.platform,
    p.post_type,
    p.topic,
    p.user_id,
    p.created_at,
    CASE
        WHEN i.id IS NOT NULL THEN true
        ELSE false
    END as has_image,
    CASE
        WHEN v.id IS NOT NULL THEN true
        ELSE false
    END as has_video
FROM generated_posts p
LEFT JOIN generated_images i ON p.id = i.post_id
LEFT JOIN generated_videos v ON p.id = v.post_id
ORDER BY p.created_at DESC
LIMIT 100;

DROP VIEW IF EXISTS platform_statistics;
CREATE VIEW platform_statistics AS
SELECT
    platform,
    COUNT(*) as total_posts,
    AVG(generation_time_ms) as avg_generation_time,
    SUM(tokens_used) as total_tokens,
    SUM(estimated_cost_usd) as total_cost
FROM generated_posts
GROUP BY platform;


-- ───────────────────────────────────────────────────────────────
-- 10. Backfill existing orphan rows (optional)
-- ───────────────────────────────────────────────────────────────
-- Rows without a user_id will be invisible under RLS (which is correct).
-- If you need to assign them to a specific user, run:
--
--   UPDATE generated_posts SET user_id = '<admin_user_id>' WHERE user_id IS NULL;
--   UPDATE generated_images SET user_id = '<admin_user_id>' WHERE user_id IS NULL;
--   UPDATE generated_videos SET user_id = '<admin_user_id>' WHERE user_id IS NULL;
--   UPDATE usage_analytics SET user_id = '<admin_user_id>' WHERE user_id IS NULL;
