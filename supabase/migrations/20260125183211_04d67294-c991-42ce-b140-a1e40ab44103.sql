-- Add demographic and device columns to public_glucose_data
ALTER TABLE public_glucose_data 
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS diabetes_duration_years INTEGER,
ADD COLUMN IF NOT EXISTS pump_model TEXT,
ADD COLUMN IF NOT EXISTS cgm_model TEXT,
ADD COLUMN IF NOT EXISTS basal_rate NUMERIC,
ADD COLUMN IF NOT EXISTS correction_factor INTEGER,
ADD COLUMN IF NOT EXISTS carb_ratio INTEGER,
ADD COLUMN IF NOT EXISTS location_region TEXT,
ADD COLUMN IF NOT EXISTS control_level TEXT;

-- Create quality_of_life_experiences table
CREATE TABLE IF NOT EXISTS public.quality_of_life_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  source TEXT,
  source_url TEXT,
  upvotes INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quality_of_life_experiences ENABLE ROW LEVEL SECURITY;

-- Public read access for QoL experiences
CREATE POLICY "Public read access for quality of life experiences"
  ON public.quality_of_life_experiences FOR SELECT TO public USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_glucose_age_range ON public_glucose_data(age_range);
CREATE INDEX IF NOT EXISTS idx_public_glucose_cgm_model ON public_glucose_data(cgm_model);
CREATE INDEX IF NOT EXISTS idx_public_glucose_pump_model ON public_glucose_data(pump_model);
CREATE INDEX IF NOT EXISTS idx_public_glucose_location_region ON public_glucose_data(location_region);
CREATE INDEX IF NOT EXISTS idx_qol_experiences_category ON public.quality_of_life_experiences(category);