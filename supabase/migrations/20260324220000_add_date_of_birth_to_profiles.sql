-- Migration: ensure date_of_birth exists on profiles table
-- This is idempotent — safe to run multiple times.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'profiles'
          AND column_name  = 'date_of_birth'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
        COMMENT ON COLUMN public.profiles.date_of_birth IS 'Optional date of birth, collected during user registration.';
    END IF;
END;
$$;
