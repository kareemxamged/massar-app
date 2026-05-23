-- ============================================================================
-- COMPLETE FIX: Fix All RLS Policies to Prevent Infinite Recursion
-- ============================================================================

-- Step 1: Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users view own or admin views all" ON public.profiles;
DROP POLICY IF EXISTS "Users update own or admin updates any" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 2: Create security definer function to check admin status
-- SECURITY DEFINER bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- Step 3: Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- Step 4: Create new non-recursive policies using the function

-- SELECT: Users can view their own profile, Admins can view all
CREATE POLICY "Users view own or admin views all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR public.is_admin(auth.uid())
  );

-- INSERT: Only admins can insert new profiles
CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
  );

-- UPDATE: Users can update own, Admins can update any
CREATE POLICY "Users update own or admin updates any"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR public.is_admin(auth.uid())
  );

-- DELETE: Only admins can delete profiles
CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    public.is_admin(auth.uid())
  );

-- ============================================================================
-- Also fix majors and academic_levels policies if needed
-- ============================================================================

-- Ensure majors table has proper policies
DROP POLICY IF EXISTS "Anyone can view majors" ON public.majors;
CREATE POLICY "Anyone can view majors" 
  ON public.majors FOR SELECT 
  USING (true);

-- Ensure academic_levels table has proper policies  
DROP POLICY IF EXISTS "Anyone can view academic_levels" ON public.academic_levels;
CREATE POLICY "Anyone can view academic_levels" 
  ON public.academic_levels FOR SELECT 
  USING (true);

-- ============================================================================
-- Fix for auth.users view if needed (for edge cases)
-- ============================================================================

-- Create a function that safely gets user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN user_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon;
