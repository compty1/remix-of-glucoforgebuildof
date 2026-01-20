-- Add new columns to devices table for autonomy, updates, and lifecycle
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS change_frequency text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS charging_frequency text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS charging_method text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS autonomy_level text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS user_input_required text[];
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS decision_automation text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS learning_capability boolean DEFAULT false;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS update_frequency text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_update_version text;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_update_date date;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS latest_update_features text[];
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS future_updates jsonb;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS future_device_plans text;

-- Add location and contact fields to clinical_trials_detailed
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS locations jsonb;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS recruiting_status text;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS accepts_healthy_volunteers boolean;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS age_requirement_min integer;
ALTER TABLE public.clinical_trials_detailed ADD COLUMN IF NOT EXISTS age_requirement_max integer;

-- Create medication_interactions table
CREATE TABLE IF NOT EXISTS public.medication_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id uuid REFERENCES public.medications(id) ON DELETE CASCADE,
  interacting_drug_name text NOT NULL,
  interacting_drug_category text,
  severity text NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'contraindicated')),
  description text NOT NULL,
  clinical_effects text,
  management_recommendation text,
  source text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on medication_interactions
ALTER TABLE public.medication_interactions ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Anyone can view medication interactions" ON public.medication_interactions
  FOR SELECT USING (true);

-- Create quality_of_life_resources table
CREATE TABLE IF NOT EXISTS public.quality_of_life_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  benefits_for_t1d text,
  scientific_evidence_level text CHECK (scientific_evidence_level IN ('strong', 'moderate', 'emerging', 'anecdotal')),
  recommended_by_community boolean DEFAULT false,
  source_url text,
  image_url text,
  dosage_info text,
  precautions text,
  cost_range text,
  availability text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quality_of_life_resources
ALTER TABLE public.quality_of_life_resources ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Anyone can view quality of life resources" ON public.quality_of_life_resources
  FOR SELECT USING (true);

-- Create t1d_supplement_deficiencies table
CREATE TABLE IF NOT EXISTS public.t1d_supplement_deficiencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrient_name text NOT NULL,
  prevalence_in_t1d decimal,
  symptoms_of_deficiency text[],
  recommended_daily_amount text,
  food_sources text[],
  supplement_form text,
  testing_method text,
  interaction_with_insulin text,
  optimal_timing text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.t1d_supplement_deficiencies ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Anyone can view supplement deficiencies" ON public.t1d_supplement_deficiencies
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medication_interactions_medication_id ON public.medication_interactions(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_interactions_severity ON public.medication_interactions(severity);
CREATE INDEX IF NOT EXISTS idx_qol_resources_category ON public.quality_of_life_resources(category);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_recruiting ON public.clinical_trials_detailed(recruiting_status);