-- Add enhanced fields to diabetic_health_projects table
ALTER TABLE public.diabetic_health_projects 
ADD COLUMN IF NOT EXISTS possible_causes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_volume_monthly INTEGER,
ADD COLUMN IF NOT EXISTS affected_population_estimate INTEGER,
ADD COLUMN IF NOT EXISTS condition_triggers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_conditions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS management_difficulty TEXT,
ADD COLUMN IF NOT EXISTS time_to_diagnosis_avg TEXT,
ADD COLUMN IF NOT EXISTS commonly_misdiagnosed_as TEXT[] DEFAULT '{}';