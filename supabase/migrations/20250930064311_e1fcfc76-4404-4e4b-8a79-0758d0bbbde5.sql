-- Phase 1: Enhanced Research & Medical Data Schema

-- Create FDA device events table for recalls, adverse events, clearances
CREATE TABLE public.fda_device_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'recall', 'adverse_event', '510k_clearance', 'pma_approval'
  fda_event_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  manufacturer_name TEXT,
  event_date DATE,
  event_description TEXT,
  severity_level TEXT, -- 'Class I', 'Class II', 'Class III' for recalls
  status TEXT DEFAULT 'active',
  source_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create detailed clinical trials table
CREATE TABLE public.clinical_trials_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nct_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  brief_summary TEXT,
  detailed_description TEXT,
  phase TEXT, -- 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'
  study_type TEXT,
  overall_status TEXT,
  primary_purpose TEXT,
  intervention_type TEXT,
  sponsor_name TEXT,
  lead_sponsor_class TEXT,
  start_date DATE,
  completion_date DATE,
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
  source_registry TEXT DEFAULT 'clinicaltrials.gov',
  study_url TEXT,
  last_update_date DATE,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical research papers table for Europe PMC and enhanced PubMed
CREATE TABLE public.medical_research_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id TEXT UNIQUE NOT NULL, -- PMID, PMC ID, or Europe PMC ID
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  journal_name TEXT,
  publication_date DATE,
  doi TEXT,
  pmid TEXT,
  pmc_id TEXT,
  europe_pmc_id TEXT,
  study_type TEXT, -- 'Clinical Trial', 'Systematic Review', 'Meta-Analysis', etc.
  keywords TEXT[],
  mesh_terms TEXT[],
  citation_count INTEGER DEFAULT 0,
  impact_factor DECIMAL,
  open_access BOOLEAN DEFAULT false,
  pdf_url TEXT,
  full_text_url TEXT,
  source_database TEXT NOT NULL, -- 'pubmed', 'europe_pmc', 'pmc'
  diabetes_relevance_score INTEGER, -- 1-10 relevance to diabetes
  device_mentions TEXT[], -- mentioned diabetes devices
  drug_mentions TEXT[], -- mentioned diabetes drugs
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance existing research_items table with new fields
ALTER TABLE public.research_items 
ADD COLUMN IF NOT EXISTS study_type TEXT,
ADD COLUMN IF NOT EXISTS authors TEXT[],
ADD COLUMN IF NOT EXISTS publication_date DATE,
ADD COLUMN IF NOT EXISTS doi TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS diabetes_relevance_score INTEGER,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Create indexes for better performance
CREATE INDEX idx_fda_device_events_type ON public.fda_device_events(event_type);
CREATE INDEX idx_fda_device_events_date ON public.fda_device_events(event_date);
CREATE INDEX idx_fda_device_events_manufacturer ON public.fda_device_events(manufacturer_name);

CREATE INDEX idx_clinical_trials_phase ON public.clinical_trials_detailed(phase);
CREATE INDEX idx_clinical_trials_status ON public.clinical_trials_detailed(overall_status);
CREATE INDEX idx_clinical_trials_start_date ON public.clinical_trials_detailed(start_date);
CREATE INDEX idx_clinical_trials_conditions ON public.clinical_trials_detailed USING GIN(conditions);

CREATE INDEX idx_research_papers_date ON public.medical_research_papers(publication_date);
CREATE INDEX idx_research_papers_journal ON public.medical_research_papers(journal_name);
CREATE INDEX idx_research_papers_keywords ON public.medical_research_papers USING GIN(keywords);
CREATE INDEX idx_research_papers_device_mentions ON public.medical_research_papers USING GIN(device_mentions);

-- Enable RLS on new tables
ALTER TABLE public.fda_device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_research_papers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "FDA device events are viewable by everyone" 
ON public.fda_device_events 
FOR SELECT 
USING (true);

CREATE POLICY "Clinical trials are viewable by everyone" 
ON public.clinical_trials_detailed 
FOR SELECT 
USING (true);

CREATE POLICY "Medical research papers are viewable by everyone" 
ON public.medical_research_papers 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fda_device_events_updated_at
BEFORE UPDATE ON public.fda_device_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_trials_updated_at
BEFORE UPDATE ON public.clinical_trials_detailed
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_research_papers_updated_at
BEFORE UPDATE ON public.medical_research_papers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();