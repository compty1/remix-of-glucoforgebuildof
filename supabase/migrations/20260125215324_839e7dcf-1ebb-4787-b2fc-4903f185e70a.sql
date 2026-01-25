-- Create donations_data table for T1D organization funding information
CREATE TABLE public.donations_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'nonprofit', -- nonprofit, research_institute, hospital, foundation
  year INTEGER NOT NULL,
  total_donations DECIMAL(12,2),
  research_allocation_percent INTEGER,
  operations_allocation_percent INTEGER,
  education_allocation_percent INTEGER,
  advocacy_allocation_percent INTEGER,
  sector_corporate DECIMAL(12,2),
  sector_individual DECIMAL(12,2),
  sector_foundation DECIMAL(12,2),
  sector_government DECIMAL(12,2),
  impact_patients_helped INTEGER,
  impact_studies_funded INTEGER,
  impact_trials_supported INTEGER,
  top_programs TEXT[],
  notable_donors TEXT[],
  website_url TEXT,
  logo_url TEXT,
  source_990_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_community_buzz table for social sentiment on apps
CREATE TABLE public.app_community_buzz (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES public.diabetes_apps(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  source_platform TEXT NOT NULL DEFAULT 'reddit', -- reddit, twitter, facebook, etc
  author_anonymous TEXT,
  content TEXT NOT NULL,
  sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
  upvotes INTEGER DEFAULT 0,
  category TEXT, -- praise, complaint, tip, question
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_community_buzz ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Donations data is viewable by everyone" 
ON public.donations_data FOR SELECT USING (true);

CREATE POLICY "App community buzz is viewable by everyone" 
ON public.app_community_buzz FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_donations_data_year ON public.donations_data(year);
CREATE INDEX idx_donations_data_org ON public.donations_data(organization_name);
CREATE INDEX idx_app_community_buzz_app ON public.app_community_buzz(app_id);
CREATE INDEX idx_app_community_buzz_sentiment ON public.app_community_buzz(sentiment);

-- Trigger for updated_at
CREATE TRIGGER update_donations_data_updated_at
BEFORE UPDATE ON public.donations_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();