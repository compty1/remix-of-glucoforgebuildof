-- Add missing columns to uploads table for glucose analysis
ALTER TABLE public.uploads 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS insights TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS readings_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS analysis_results JSONB;

-- Add UPDATE policy for users on their own uploads
CREATE POLICY "Users can update their own uploads"
  ON public.uploads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create t1d_resources table for comprehensive resources
CREATE TABLE IF NOT EXISTS public.t1d_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  resource_type TEXT,
  external_url TEXT,
  is_internal_tool BOOLEAN DEFAULT false,
  internal_route TEXT,
  icon_name TEXT,
  featured BOOLEAN DEFAULT false,
  target_audience TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on t1d_resources
ALTER TABLE public.t1d_resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to resources
CREATE POLICY "Anyone can read resources"
  ON public.t1d_resources
  FOR SELECT
  USING (true);

-- Create state_diabetes_forms table
CREATE TABLE IF NOT EXISTS public.state_diabetes_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code TEXT NOT NULL,
  state_name TEXT NOT NULL,
  form_category TEXT NOT NULL,
  form_name TEXT NOT NULL,
  form_description TEXT,
  form_url TEXT,
  issuing_agency TEXT,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on state_diabetes_forms
ALTER TABLE public.state_diabetes_forms ENABLE ROW LEVEL SECURITY;

-- Allow public read access to state forms
CREATE POLICY "Anyone can read state forms"
  ON public.state_diabetes_forms
  FOR SELECT
  USING (true);

-- Create index for efficient state lookups
CREATE INDEX IF NOT EXISTS idx_state_forms_state_code ON public.state_diabetes_forms(state_code);
CREATE INDEX IF NOT EXISTS idx_state_forms_category ON public.state_diabetes_forms(form_category);