-- Add comprehensive analysis columns to uploads table
ALTER TABLE public.uploads 
  ADD COLUMN IF NOT EXISTS detailed_analysis JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hourly_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS daily_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS agp_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS patterns JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommendations TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '{}'::jsonb;