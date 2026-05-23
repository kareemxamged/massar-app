-- ============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users view own or admin views all" ON public.profiles;
DROP POLICY IF EXISTS "Users update own or admin updates any" ON public.profiles;

-- Create a security definer function to check admin status
-- This bypasses RLS to avoid infinite recursion
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;

-- Recreate SELECT policy using the function
CREATE POLICY "Users view own or admin views all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR public.is_admin(auth.uid())
  );

-- Recreate UPDATE policy using the function
CREATE POLICY "Users update own or admin updates any"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR public.is_admin(auth.uid())
  );

-- Keep INSERT and DELETE policies as-is (they don't need the recursive check)
-- "Admin can insert profiles" - already uses EXISTS subquery but only for INSERT
-- "Admin can delete profiles" - already uses EXISTS subquery but only for DELETE

-- Note: The INSERT and DELETE policies may also need fixing if they cause recursion.
-- Let me also fix them to use the function:

DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    public.is_admin(auth.uid())
  );
