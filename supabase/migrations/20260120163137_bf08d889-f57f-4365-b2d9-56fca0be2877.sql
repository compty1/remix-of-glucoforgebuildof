-- Enhance surveys table with research-grade fields
ALTER TABLE public.surveys 
ADD COLUMN IF NOT EXISTS survey_type TEXT DEFAULT 'survey',
ADD COLUMN IF NOT EXISTS research_category TEXT,
ADD COLUMN IF NOT EXISTS institution_partner TEXT,
ADD COLUMN IF NOT EXISTS irb_number TEXT,
ADD COLUMN IF NOT EXISTS consent_text TEXT,
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_demographics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS target_responses INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enhance survey_responses table with research metadata
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create survey_demographics table for research requiring demographic data
CREATE TABLE IF NOT EXISTS public.survey_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  age_range TEXT,
  gender TEXT,
  diagnosis_year INTEGER,
  diabetes_type TEXT DEFAULT 'Type 1',
  therapy_type TEXT,
  cgm_usage TEXT,
  pump_usage TEXT,
  a1c_range TEXT,
  years_with_diabetes INTEGER,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on survey_demographics
ALTER TABLE public.survey_demographics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for survey_demographics
CREATE POLICY "Users can view their own demographics"
  ON public.survey_demographics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own demographics"
  ON public.survey_demographics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demographics"
  ON public.survey_demographics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_survey_demographics_user_id ON public.survey_demographics(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_research_category ON public.surveys(research_category);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON public.survey_responses(completed_at);