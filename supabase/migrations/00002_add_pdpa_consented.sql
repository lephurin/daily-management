-- ============================================================
-- Migration: Add pdpa_consented to user_profiles
-- ============================================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS pdpa_consented BOOLEAN DEFAULT FALSE;
