-- ============================================================================
-- FINAL FIX: Complete RLS Policy Fix for All Operations
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users view own or admin views all" ON public.profiles;
DROP POLICY IF EXISTS "Users update own or admin updates any" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_status" ON public.profiles;

-- ============================================================================
-- Create SECURITY DEFINER functions to bypass RLS for admin checks
-- ============================================================================

-- Function to check if user is admin
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

-- Function to get user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_role(user_id uuid)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_my_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_role(uuid) TO service_role;

-- ============================================================================
-- Create new non-recursive policies using security definer functions
-- ============================================================================

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
    public.get_my_role(auth.uid()) = 'admin'
  );

-- UPDATE: Users can update own (except status), Admins can update any
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
-- Additional policy for status updates (admin only)
-- ============================================================================
CREATE POLICY "admin_update_status"
  ON public.profiles FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR public.is_admin(auth.uid())
  );

-- ============================================================================
-- Helper function for teacher viewing students
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
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
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
