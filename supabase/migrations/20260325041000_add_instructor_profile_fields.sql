-- Add specialized Instructor fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS academic_degree TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- Update the app_role enum to ensure instructor is explicitly supported if it isn't already handled by teacher
-- Note: the application logic treats 'teacher' and 'instructor' interchangeably in many places, 
-- but we only add columns here.
