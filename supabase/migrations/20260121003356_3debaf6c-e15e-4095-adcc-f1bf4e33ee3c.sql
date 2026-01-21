-- Create device_user_fixes table for community-found hacks and workarounds
CREATE TABLE public.device_user_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_steps TEXT[],
  category TEXT CHECK (category IN ('sensor_extension', 'adhesive', 'accuracy', 'app', 'hardware', 'calibration', 'connectivity', 'other')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
  votes INTEGER DEFAULT 0,
  source TEXT CHECK (source IN ('reddit', 'facebook', 'tudiabetes', 'community', 'glucoforge')),
  source_url TEXT,
  warnings TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create medication_community_feedback table for real user experiences
CREATE TABLE public.medication_community_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
  feedback_type TEXT CHECK (feedback_type IN ('issue', 'praise', 'tip', 'why_chosen', 'why_switched')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  source TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create glucose_analysis_entries to link uploads to journal
CREATE TABLE public.glucose_analysis_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  pattern_type TEXT,
  glucose_direction TEXT,
  time_of_day TEXT,
  avg_glucose NUMERIC,
  context TEXT,
  auto_detected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_device_user_fixes_device ON public.device_user_fixes(device_id);
CREATE INDEX idx_device_user_fixes_category ON public.device_user_fixes(category);
CREATE INDEX idx_device_user_fixes_votes ON public.device_user_fixes(votes DESC);
CREATE INDEX idx_medication_feedback_medication ON public.medication_community_feedback(medication_id);
CREATE INDEX idx_medication_feedback_type ON public.medication_community_feedback(feedback_type);
CREATE INDEX idx_glucose_entries_user ON public.glucose_analysis_entries(user_id);
CREATE INDEX idx_glucose_entries_upload ON public.glucose_analysis_entries(upload_id);

-- Enable RLS
ALTER TABLE public.device_user_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_community_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_analysis_entries ENABLE ROW LEVEL SECURITY;

-- Public read for device fixes and medication feedback
CREATE POLICY "Anyone can view device fixes" ON public.device_user_fixes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view medication feedback" ON public.medication_community_feedback
  FOR SELECT USING (true);

-- Users can only see their own glucose analysis entries
CREATE POLICY "Users can view their own glucose entries" ON public.glucose_analysis_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose entries" ON public.glucose_analysis_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose entries" ON public.glucose_analysis_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose entries" ON public.glucose_analysis_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_device_user_fixes_updated_at
  BEFORE UPDATE ON public.device_user_fixes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();