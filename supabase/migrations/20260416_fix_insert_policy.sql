-- ============================================================================
-- FIX: Allow Admin to Insert Profiles (403 Forbidden Error)
-- ============================================================================

-- The issue: The INSERT policy checks is_admin() but the function may not work
-- correctly for new inserts because it checks the profiles table which may not
-- have the user yet (chicken-and-egg problem).

-- Solution: Check auth.users metadata or use a different approach

-- First, let's check if user is admin by looking at their JWT claims or a different method
-- The safest approach is to check if the user's role is 'admin' in the profiles table
-- but we need to handle the case where the user is creating their own profile

-- Drop existing insert policy
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;

-- Create a new insert policy that:
-- 1. Allows users to create their own profile (for signup)
-- 2. Allows admins to create any profile
CREATE POLICY "Users create own or admin inserts any"
  ON public.profiles FOR INSERT
  WITH CHECK (
    -- User can create their own profile
    auth.uid() = id
    -- Or admin can create any profile
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Alternative approach if the above doesn't work:
-- Use a security definer function that bypasses RLS for admin check

-- Create function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin(uuid) TO service_role;

-- If the complex policy still fails, use a simpler approach:
-- Drop and recreate with just the self-creation rule (safer)
-- Then handle admin inserts via service_role or edge functions

-- For now, let's also ensure the admin has proper permissions
-- Make sure the admin user's profile exists and has correct role

-- Debug: Check if RLS is enabled
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure policies are applied
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
