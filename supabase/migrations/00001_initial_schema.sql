-- ============================================================
-- Supabase Schema: Daily Tracking Dashboard
-- Simplified for NextAuth (uses email as user_id, not Supabase Auth UUID)
-- ============================================================

-- ============================================================
-- 0. USER_PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- email from NextAuth session
  name TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================================
-- 1. DAILY_NOTES (core feature)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- email from NextAuth session
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  plain_text TEXT NOT NULL DEFAULT '',
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, note_date)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_id ON public.daily_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON public.daily_notes(note_date);

-- ============================================================
-- 2. NOTE_REVISIONS (optional, for version history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.note_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.daily_notes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content JSONB NOT NULL,
  plain_text TEXT NOT NULL DEFAULT '',
  revision_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_note_revisions_note_id ON public.note_revisions(note_id);

-- ============================================================
-- UPDATED_AT trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.daily_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
