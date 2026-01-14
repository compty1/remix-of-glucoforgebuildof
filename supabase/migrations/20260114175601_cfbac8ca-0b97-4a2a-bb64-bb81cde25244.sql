-- =====================================================
-- GlucoForge Database Schema - Complete Setup
-- =====================================================

-- 1. User Profiles & Roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 2. User Dashboard Layouts
CREATE TABLE public.user_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  layout JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Uploads table for tracking user file uploads
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Research & Discovery Tables
CREATE TABLE public.research_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT,
  summary TEXT,
  source TEXT,
  impact_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.discoveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  full_text TEXT,
  discovery_type TEXT NOT NULL,
  category TEXT,
  impact_level TEXT,
  credibility_score INTEGER DEFAULT 0,
  credibility_factors JSONB,
  primary_source TEXT,
  source_urls TEXT[],
  publication_date TIMESTAMP WITH TIME ZONE,
  ai_analysis JSONB,
  cross_references JSONB,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.medical_research_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  journal_name TEXT,
  publication_date TIMESTAMP WITH TIME ZONE,
  doi TEXT,
  pmid TEXT,
  pmc_id TEXT,
  europe_pmc_id TEXT,
  study_type TEXT,
  keywords TEXT[],
  mesh_terms TEXT[],
  citation_count INTEGER,
  impact_factor NUMERIC,
  open_access BOOLEAN DEFAULT false,
  pdf_url TEXT,
  full_text_url TEXT,
  source_database TEXT NOT NULL,
  diabetes_relevance_score INTEGER,
  device_mentions TEXT[],
  drug_mentions TEXT[],
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Clinical Trials
CREATE TABLE public.clinical_trials_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nct_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  brief_summary TEXT,
  detailed_description TEXT,
  phase TEXT,
  study_type TEXT,
  overall_status TEXT,
  primary_purpose TEXT,
  intervention_type TEXT,
  sponsor_name TEXT,
  lead_sponsor_class TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  enrollment_count INTEGER,
  location_countries TEXT[],
  conditions TEXT[],
  interventions TEXT[],
  primary_outcomes TEXT[],
  secondary_outcomes TEXT[],
  eligibility_criteria TEXT,
  min_age TEXT,
  max_age TEXT,
  gender TEXT,
  source_registry TEXT NOT NULL,
  study_url TEXT,
  last_update_date TIMESTAMP WITH TIME ZONE,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Cure Monitoring
CREATE TABLE public.cure_therapies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  phase TEXT,
  category TEXT,
  sponsor TEXT,
  progress_percentage INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Active',
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cure_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapy_id UUID REFERENCES public.cure_therapies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Devices & Analytics
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT,
  category TEXT,
  model_number TEXT,
  description TEXT,
  key_features TEXT[],
  pros TEXT[],
  cons TEXT[],
  retail_price_usd NUMERIC,
  image_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.device_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  reliability_score INTEGER,
  social_setting_score INTEGER,
  total_reviews INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.device_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  issue_title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  frequency_percentage NUMERIC,
  solution TEXT,
  workaround TEXT,
  community_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. FDA Data
CREATE TABLE public.fda_device_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  fda_event_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  manufacturer_name TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  event_description TEXT,
  severity_level TEXT,
  status TEXT DEFAULT 'Active',
  source_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Community Posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  post_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  author_anonymous TEXT,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  device_mentioned TEXT,
  sentiment TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Financial Data
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  ticker_symbol TEXT NOT NULL,
  current_price NUMERIC,
  market_cap NUMERIC,
  change_percent NUMERIC,
  volume BIGINT,
  data_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.drug_pricing_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name TEXT NOT NULL,
  manufacturer TEXT,
  ndc_code TEXT,
  unit_price NUMERIC,
  medicare_price NUMERIC,
  year INTEGER,
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Medicare Coverage Data
CREATE TABLE public.medicare_coverage_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_name TEXT NOT NULL,
  coverage_status TEXT,
  coverage_details JSONB,
  ncd_number TEXT,
  effective_date DATE,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Patent Data
CREATE TABLE public.patent_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patent_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  inventors TEXT[],
  assignee TEXT,
  patent_date DATE,
  diabetes_relevance_score INTEGER,
  patent_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Research Funding
CREATE TABLE public.research_funding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number TEXT UNIQUE NOT NULL,
  project_title TEXT NOT NULL,
  principal_investigator TEXT,
  organization TEXT,
  funding_amount NUMERIC,
  fiscal_year INTEGER,
  project_start_date DATE,
  project_end_date DATE,
  abstract TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Surveys
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, user_id)
);

-- =====================================================
-- Enable Row Level Security on all tables
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cure_therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cure_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fda_device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_pricing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicare_coverage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patent_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for User-Specific Tables
-- =====================================================

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User Roles: Users can read their own roles, admins can manage all
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- User Dashboards: Users can only access their own dashboard
CREATE POLICY "Users can view their own dashboard" ON public.user_dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own dashboard" ON public.user_dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dashboard" ON public.user_dashboards FOR UPDATE USING (auth.uid() = user_id);

-- Uploads: Users can only access their own uploads
CREATE POLICY "Users can view their own uploads" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own uploads" ON public.uploads FOR DELETE USING (auth.uid() = user_id);

-- Survey Responses: Users can only manage their own responses
CREATE POLICY "Users can view their own survey responses" ON public.survey_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own survey responses" ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own survey responses" ON public.survey_responses FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for Public Read Tables (everyone can read)
-- =====================================================

-- Research & Discovery (public read, service role write)
CREATE POLICY "Anyone can read research items" ON public.research_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read discoveries" ON public.discoveries FOR SELECT USING (true);
CREATE POLICY "Anyone can read medical research papers" ON public.medical_research_papers FOR SELECT USING (true);
CREATE POLICY "Anyone can read clinical trials" ON public.clinical_trials_detailed FOR SELECT USING (true);

-- Cure Monitoring (public read)
CREATE POLICY "Anyone can read cure therapies" ON public.cure_therapies FOR SELECT USING (true);
CREATE POLICY "Anyone can read cure milestones" ON public.cure_milestones FOR SELECT USING (true);

-- Devices (public read)
CREATE POLICY "Anyone can read devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Anyone can read device metrics" ON public.device_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can read device issues" ON public.device_issues FOR SELECT USING (true);

-- FDA Data (public read)
CREATE POLICY "Anyone can read FDA events" ON public.fda_device_events FOR SELECT USING (true);

-- Community Posts (public read)
CREATE POLICY "Anyone can read community posts" ON public.community_posts FOR SELECT USING (true);

-- Financial Data (public read)
CREATE POLICY "Anyone can read market data" ON public.market_data FOR SELECT USING (true);
CREATE POLICY "Anyone can read drug pricing" ON public.drug_pricing_data FOR SELECT USING (true);

-- Medicare Data (public read)
CREATE POLICY "Anyone can read medicare coverage" ON public.medicare_coverage_data FOR SELECT USING (true);

-- Patent Data (public read)
CREATE POLICY "Anyone can read patent data" ON public.patent_data FOR SELECT USING (true);

-- Research Funding (public read)
CREATE POLICY "Anyone can read research funding" ON public.research_funding FOR SELECT USING (true);

-- Surveys (public read)
CREATE POLICY "Anyone can read surveys" ON public.surveys FOR SELECT USING (true);

-- =====================================================
-- Update Timestamp Trigger Function
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_dashboards_updated_at BEFORE UPDATE ON public.user_dashboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_research_items_updated_at BEFORE UPDATE ON public.research_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_research_papers_updated_at BEFORE UPDATE ON public.medical_research_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinical_trials_updated_at BEFORE UPDATE ON public.clinical_trials_detailed FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cure_therapies_updated_at BEFORE UPDATE ON public.cure_therapies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fda_events_updated_at BEFORE UPDATE ON public.fda_device_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON public.market_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drug_pricing_updated_at BEFORE UPDATE ON public.drug_pricing_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicare_data_updated_at BEFORE UPDATE ON public.medicare_coverage_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patent_data_updated_at BEFORE UPDATE ON public.patent_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_research_funding_updated_at BEFORE UPDATE ON public.research_funding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Create Indexes for Better Query Performance
-- =====================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_dashboards_user_id ON public.user_dashboards(user_id);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_discoveries_type ON public.discoveries(discovery_type);
CREATE INDEX idx_discoveries_credibility ON public.discoveries(credibility_score DESC);
CREATE INDEX idx_clinical_trials_phase ON public.clinical_trials_detailed(phase);
CREATE INDEX idx_clinical_trials_status ON public.clinical_trials_detailed(overall_status);
CREATE INDEX idx_cure_therapies_status ON public.cure_therapies(status);
CREATE INDEX idx_device_issues_device_id ON public.device_issues(device_id);
CREATE INDEX idx_device_metrics_device_id ON public.device_metrics(device_id);
CREATE INDEX idx_community_posts_device ON public.community_posts(device_mentioned);
CREATE INDEX idx_community_posts_published ON public.community_posts(published_at DESC);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user_id ON public.survey_responses(user_id);