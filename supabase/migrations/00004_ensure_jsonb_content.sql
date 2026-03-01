-- ============================================================
-- Migration: Ensure content columns are JSONB
-- ============================================================
-- Since we changed from Tiptap to BlockNote, both formats store rich text data as JSON.
-- This script safely ensures that the `content` column in `daily_notes` (and `note_revisions`) 
-- is explicitly cast and set to JSONB, optimizing it for BlockNote's Block[] array storage.

DO $$ 
BEGIN
  -- 1. Ensure daily_notes.content is jsonb
  ALTER TABLE public.daily_notes 
    ALTER COLUMN content SET DATA TYPE jsonb 
    USING content::jsonb;

  -- 2. Ensure note_revisions.content is jsonb (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'note_revisions') THEN
    ALTER TABLE public.note_revisions 
      ALTER COLUMN content SET DATA TYPE jsonb 
      USING content::jsonb;
  END IF;
END $$;
