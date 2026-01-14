-- Add missing tables and fix shifts table for Journal page

-- Drop and recreate shifts with correct structure for Journal (glycemic shifts)
DROP TABLE IF EXISTS public.shifts CASCADE;
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shift_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  direction TEXT, -- 'up', 'down', 'stable'
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Simulations table for ScenarioLab
CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  params JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial resources table
CREATE TABLE public.financial_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  category TEXT,
  resource_type TEXT,
  provider TEXT,
  eligibility_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend analysis metrics table
CREATE TABLE public.trend_analysis_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  seven_day_count INTEGER DEFAULT 0,
  thirty_day_count INTEGER DEFAULT 0,
  trend_direction TEXT,
  category TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saved insights for bookmarking
CREATE TABLE public.saved_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_analysis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;

-- RLS for shifts - users can only access their own
CREATE POLICY "Users can view their own shifts" ON public.shifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own shifts" ON public.shifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shifts" ON public.shifts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shifts" ON public.shifts FOR DELETE USING (auth.uid() = user_id);

-- RLS for simulations - users can only access their own
CREATE POLICY "Users can view their own simulations" ON public.simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own simulations" ON public.simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own simulations" ON public.simulations FOR DELETE USING (auth.uid() = user_id);

-- RLS for financial_resources - public read
CREATE POLICY "Anyone can read financial resources" ON public.financial_resources FOR SELECT USING (true);

-- RLS for trend_analysis_metrics - public read
CREATE POLICY "Anyone can read trend metrics" ON public.trend_analysis_metrics FOR SELECT USING (true);

-- RLS for saved_insights - users can only access their own
CREATE POLICY "Users can view their own saved insights" ON public.saved_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved insights" ON public.saved_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved insights" ON public.saved_insights FOR DELETE USING (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_resources_updated_at BEFORE UPDATE ON public.financial_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a simple update_trends function that the Admin page calls
CREATE OR REPLACE FUNCTION public.update_trends()
RETURNS void AS $$
BEGIN
  -- This is a placeholder function that could be expanded to calculate trends
  -- For now, it just returns successfully
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes
CREATE INDEX idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX idx_saved_insights_user_id ON public.saved_insights(user_id);
CREATE INDEX idx_trend_metrics_category ON public.trend_analysis_metrics(category);