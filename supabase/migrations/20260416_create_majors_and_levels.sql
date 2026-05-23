-- 1. Create majors table
CREATE TABLE IF NOT EXISTS public.majors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create academic_levels table  
CREATE TABLE IF NOT EXISTS public.academic_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed default majors (only if table is empty)
INSERT INTO public.majors (name, code, description)
SELECT * FROM (VALUES
  ('Computer Science', 'CS', 'Computer Science and Engineering'),
  ('Information Technology', 'IT', 'Information Technology and Systems'),
  ('Software Engineering', 'SE', 'Software Engineering'),
  ('Data Science', 'DS', 'Data Science and Analytics'),
  ('Cybersecurity', 'CYBER', 'Cybersecurity and Information Assurance'),
  ('Business Administration', 'BA', 'Business Administration'),
  ('Medicine', 'MED', 'Medical Sciences'),
  ('Engineering', 'ENG', 'General Engineering')
) AS v(name, code, description)
WHERE NOT EXISTS (SELECT 1 FROM public.majors LIMIT 1);

-- 4. Seed default academic levels (only if table is empty)
INSERT INTO public.academic_levels (name, code, display_order)
SELECT * FROM (VALUES
  ('Undergraduate', 'undergraduate', 1),
  ('Graduate', 'graduate', 2),
  ('PhD', 'phd', 3),
  ('Diploma', 'diploma', 4)
) AS v(name, code, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.academic_levels LIMIT 1);

-- 5. RLS Policies for majors
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view majors" ON public.majors;
CREATE POLICY "Anyone can view majors"
  ON public.majors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify majors" ON public.majors;
CREATE POLICY "Only admins can modify majors"
  ON public.majors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 6. RLS Policies for academic_levels
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view academic_levels" ON public.academic_levels;
CREATE POLICY "Anyone can view academic_levels"
  ON public.academic_levels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify academic_levels" ON public.academic_levels;
CREATE POLICY "Only admins can modify academic_levels"
  ON public.academic_levels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));
