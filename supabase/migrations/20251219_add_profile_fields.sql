-- Add new columns for extended user profile data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS student_id text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS employee_id text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS subjects text; -- Stored as comma-separated string or could be array, keeping text for simplicity
