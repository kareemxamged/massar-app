-- Create majors table
CREATE TABLE IF NOT EXISTS public.majors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create academic_levels table
CREATE TABLE IF NOT EXISTS public.academic_levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add date_of_birth to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add foreign key references
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS major_id INTEGER REFERENCES public.majors(id) ON DELETE SET NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level_id INTEGER REFERENCES public.academic_levels(id) ON DELETE SET NULL;

-- Seed majors
INSERT INTO public.majors (name, code) VALUES
    ('Computer Science', 'CS'),
    ('Information Technology', 'IT'),
    ('Software Engineering', 'SE'),
    ('Business Administration', 'BA'),
    ('Engineering', 'ENG'),
    ('Medicine', 'MED'),
    ('Mathematics', 'MATH'),
    ('Physics', 'PHY')
ON CONFLICT (name) DO NOTHING;

-- Seed academic levels
INSERT INTO public.academic_levels (name, code, display_order) VALUES
    ('First Year', 'year_1', 1),
    ('Second Year', 'year_2', 2),
    ('Third Year', 'year_3', 3),
    ('Fourth Year', 'year_4', 4),
    ('Fifth Year', 'year_5', 5),
    ('Graduate', 'graduate', 6)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view majors" ON public.majors FOR SELECT USING (true);
CREATE POLICY "Anyone can view academic_levels" ON public.academic_levels FOR SELECT USING (true);
