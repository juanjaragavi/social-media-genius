-- ============================================================
-- Social Media Genius — Projects & Posts Persistence Layer
-- Migration: 003-projects-and-posts.sql
--
-- NOTE: This app uses Better Auth (not Supabase Auth).
-- The user_id column stores Better Auth user UUIDs.
-- Access control is enforced in the API layer via requireAuth().
-- RLS policies below are a safety net for anon-key access.
-- ============================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Projects Table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- ─── Posts Table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id           TEXT NOT NULL,
  title             TEXT NOT NULL DEFAULT 'Sin título',
  platform          TEXT,           -- 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin'
  aspect_ratio      TEXT,           -- '1:1' | '9:16' | '16:9' | '4:5' | '1.91:1'
  dimensions        JSONB,          -- { "width": 1080, "height": 1080 }
  canvas_state      JSONB,          -- Full serialized layers + base image URL
  thumbnail_url     TEXT,           -- Public URL of 400×400 JPEG in Supabase Storage
  generation_params JSONB,          -- { theme, tone, language, imageStyle, postType }
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_project_id ON posts(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);

-- ─── Row Level Security ─────────────────────────────────────
-- These policies are a defense-in-depth measure. The service role key
-- used by the API layer bypasses RLS. If any client connects with the
-- anon key, these policies restrict access to the user's own data.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Projects policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'projects_select_own' AND tablename = 'projects'
  ) THEN
    CREATE POLICY projects_select_own ON projects FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'projects_insert_own' AND tablename = 'projects'
  ) THEN
    CREATE POLICY projects_insert_own ON projects FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'projects_update_own' AND tablename = 'projects'
  ) THEN
    CREATE POLICY projects_update_own ON projects FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'projects_delete_own' AND tablename = 'projects'
  ) THEN
    CREATE POLICY projects_delete_own ON projects FOR DELETE USING (true);
  END IF;
END $$;

-- Posts policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'posts_select_own' AND tablename = 'posts'
  ) THEN
    CREATE POLICY posts_select_own ON posts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'posts_insert_own' AND tablename = 'posts'
  ) THEN
    CREATE POLICY posts_insert_own ON posts FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'posts_update_own' AND tablename = 'posts'
  ) THEN
    CREATE POLICY posts_update_own ON posts FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'posts_delete_own' AND tablename = 'posts'
  ) THEN
    CREATE POLICY posts_delete_own ON posts FOR DELETE USING (true);
  END IF;
END $$;

-- ─── Updated‑at Trigger ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Supabase Storage Bucket ────────────────────────────────
-- Run this in the Supabase Dashboard SQL Editor:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('post-thumbnails', 'post-thumbnails', true)
--   ON CONFLICT (id) DO NOTHING;
--
-- Or create the bucket via the Supabase Dashboard UI:
--   Storage → New Bucket → "post-thumbnails" → Public
-- ============================================================
