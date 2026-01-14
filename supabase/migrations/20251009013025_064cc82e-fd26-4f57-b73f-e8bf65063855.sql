-- Week 2: Financial Data Tables
CREATE TABLE public.medicare_coverage_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text NOT NULL,
  coverage_status text,
  coverage_details jsonb,
  ncd_number text,
  effective_date date,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.drug_pricing_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name text NOT NULL,
  manufacturer text,
  ndc_code text,
  unit_price numeric,
  medicare_price numeric,
  year integer,
  data_source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  ticker_symbol text NOT NULL,
  current_price numeric,
  market_cap numeric,
  change_percent numeric,
  volume bigint,
  data_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Week 3: Community & Innovation Tables
CREATE TABLE public.patent_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_id text UNIQUE NOT NULL,
  title text NOT NULL,
  abstract text,
  inventors text[],
  assignee text,
  patent_date date,
  diabetes_relevance_score integer,
  patent_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.research_funding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number text UNIQUE NOT NULL,
  project_title text NOT NULL,
  principal_investigator text,
  organization text,
  funding_amount numeric,
  fiscal_year integer,
  project_start_date date,
  project_end_date date,
  abstract text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.medicare_coverage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_pricing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patent_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_funding ENABLE ROW LEVEL SECURITY;

-- Create public read policies (data is public information)
CREATE POLICY "Medicare coverage data is viewable by everyone" 
ON public.medicare_coverage_data FOR SELECT USING (true);

CREATE POLICY "Drug pricing data is viewable by everyone" 
ON public.drug_pricing_data FOR SELECT USING (true);

CREATE POLICY "Market data is viewable by everyone" 
ON public.market_data FOR SELECT USING (true);

CREATE POLICY "Patent data is viewable by everyone" 
ON public.patent_data FOR SELECT USING (true);

CREATE POLICY "Research funding is viewable by everyone" 
ON public.research_funding FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_medicare_device_name ON public.medicare_coverage_data(device_name);
CREATE INDEX idx_drug_pricing_drug_name ON public.drug_pricing_data(drug_name);
CREATE INDEX idx_market_data_ticker ON public.market_data(ticker_symbol);
CREATE INDEX idx_market_data_date ON public.market_data(data_date DESC);
CREATE INDEX idx_patent_data_date ON public.patent_data(patent_date DESC);
CREATE INDEX idx_research_funding_year ON public.research_funding(fiscal_year DESC);

-- Create updated_at triggers
CREATE TRIGGER update_medicare_coverage_data_updated_at
BEFORE UPDATE ON public.medicare_coverage_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drug_pricing_data_updated_at
BEFORE UPDATE ON public.drug_pricing_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patent_data_updated_at
BEFORE UPDATE ON public.patent_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_funding_updated_at
BEFORE UPDATE ON public.research_funding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();