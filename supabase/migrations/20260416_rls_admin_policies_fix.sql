-- ============================================================================
-- TASK 1: Fix RLS Policies for Admin Operations on profiles table
-- ============================================================================

-- Drop existing conflicting policies (idempotent)
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- SELECT: Users can view their own profile, Admins can view all
CREATE POLICY "Users view own or admin views all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: Only admins can insert new profiles
CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- UPDATE: Users can update own, Admins can update any
CREATE POLICY "Users update own or admin updates any"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: Only admins can delete profiles
CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- TASK 2: Add Missing Teacher Profile Fields
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS academic_degree TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- ============================================================================
-- TASK 3: Re-seed Academic Levels with Numbers
-- ============================================================================

-- Clear and re-seed with numeric levels (use CASCADE due to FK constraints)
TRUNCATE TABLE public.academic_levels CASCADE;

INSERT INTO public.academic_levels (name, code, display_order) VALUES
  ('1', '1', 1),
  ('2', '2', 2),
  ('3', '3', 3),
  ('4', '4', 4),
  ('5', '5', 5),
  ('6', '6', 6);
