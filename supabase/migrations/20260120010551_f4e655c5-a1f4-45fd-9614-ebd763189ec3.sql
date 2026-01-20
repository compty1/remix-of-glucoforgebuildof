-- Create T1D Companies/Startups table for comprehensive medical tech company data
CREATE TABLE public.t1d_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_type TEXT CHECK (company_type IN ('startup', 'public', 'acquired', 'subsidiary', 'non-profit')),
  focus_areas TEXT[],
  
  -- Funding Information
  total_funding_usd NUMERIC,
  funding_rounds INTEGER,
  last_funding_date DATE,
  funding_stage TEXT,
  investors JSONB DEFAULT '[]',
  
  -- Company Details
  founded_year INTEGER,
  headquarters TEXT,
  country TEXT,
  employee_count TEXT,
  
  -- Key People
  key_people JSONB DEFAULT '[]',
  
  -- Products & Technology
  products JSONB DEFAULT '[]',
  technology_summary TEXT,
  clinical_stage TEXT,
  
  -- External Links (verified)
  website_url TEXT,
  linkedin_url TEXT,
  crunchbase_url TEXT,
  twitter_url TEXT,
  
  -- Relationships
  parent_company TEXT,
  acquired_by TEXT,
  acquisition_date DATE,
  
  -- Metadata
  data_source TEXT,
  is_active BOOLEAN DEFAULT true,
  link_verified BOOLEAN DEFAULT false,
  link_verified_at TIMESTAMPTZ,
  logo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS with public read access
ALTER TABLE public.t1d_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read t1d_companies"
  ON public.t1d_companies
  FOR SELECT
  USING (true);

-- Indexes for efficient queries
CREATE INDEX idx_t1d_companies_focus ON t1d_companies USING GIN (focus_areas);
CREATE INDEX idx_t1d_companies_country ON t1d_companies(country);
CREATE INDEX idx_t1d_companies_funding ON t1d_companies(total_funding_usd DESC NULLS LAST);
CREATE INDEX idx_t1d_companies_type ON t1d_companies(company_type);
CREATE INDEX idx_t1d_companies_active ON t1d_companies(is_active);

-- Add link verification columns to existing tables
ALTER TABLE cure_therapies ADD COLUMN IF NOT EXISTS link_verified BOOLEAN DEFAULT false;
ALTER TABLE cure_therapies ADD COLUMN IF NOT EXISTS link_verified_at TIMESTAMPTZ;

ALTER TABLE research_items ADD COLUMN IF NOT EXISTS link_verified BOOLEAN DEFAULT false;
ALTER TABLE research_items ADD COLUMN IF NOT EXISTS link_verified_at TIMESTAMPTZ;

ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS links_verified BOOLEAN DEFAULT false;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS links_verified_at TIMESTAMPTZ;

ALTER TABLE patent_data ADD COLUMN IF NOT EXISTS link_verified BOOLEAN DEFAULT false;
ALTER TABLE patent_data ADD COLUMN IF NOT EXISTS link_verified_at TIMESTAMPTZ;

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS source_link_verified BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS source_link_verified_at TIMESTAMPTZ;

-- Update trigger for t1d_companies
CREATE TRIGGER update_t1d_companies_updated_at
  BEFORE UPDATE ON public.t1d_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();