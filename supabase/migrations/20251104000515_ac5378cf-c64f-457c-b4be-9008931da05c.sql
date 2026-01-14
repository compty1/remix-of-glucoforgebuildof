-- Create unified discoveries table
CREATE TABLE IF NOT EXISTS public.discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core fields
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_text TEXT,
  
  -- Classification
  discovery_type TEXT NOT NULL CHECK (discovery_type IN ('cure_breakthrough', 'clinical_trial', 'research_paper', 'community_symptom', 'ai_correlation')),
  category TEXT CHECK (category IN ('device', 'medication', 'symptom', 'treatment', 'technology', 'research')),
  impact_level TEXT CHECK (impact_level IN ('Breakthrough', 'High', 'Medium', 'Low')),
  
  -- Credibility scoring
  credibility_score INTEGER DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  credibility_factors JSONB DEFAULT '{}'::jsonb,
  
  -- Source tracking
  primary_source TEXT,
  source_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_research_ids UUID[] DEFAULT ARRAY[]::UUID[],
  related_trial_ids UUID[] DEFAULT ARRAY[]::UUID[],
  related_post_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- AI analysis
  ai_analysis JSONB,
  cross_references JSONB[] DEFAULT ARRAY[]::JSONB[],
  
  -- Metadata
  publication_date DATE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Search
  search_vector TSVECTOR,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discoveries_type ON public.discoveries(discovery_type);
CREATE INDEX IF NOT EXISTS idx_discoveries_impact ON public.discoveries(impact_level);
CREATE INDEX IF NOT EXISTS idx_discoveries_credibility ON public.discoveries(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_discoveries_date ON public.discoveries(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_discoveries_discovered ON public.discoveries(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_discoveries_search ON public.discoveries USING GIN(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_discoveries_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.summary, '') || ' ' || 
    COALESCE(NEW.full_text, '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update search vector
CREATE TRIGGER update_discoveries_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.discoveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discoveries_search_vector();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_discoveries_updated_at
  BEFORE UPDATE ON public.discoveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Discoveries are viewable by everyone"
  ON public.discoveries
  FOR SELECT
  USING (true);

-- Create stats view for dashboard
CREATE OR REPLACE VIEW public.discovery_stats AS
SELECT 
  COUNT(*) as total_discoveries,
  COUNT(*) FILTER (WHERE discovery_type = 'cure_breakthrough') as cure_breakthroughs,
  COUNT(*) FILTER (WHERE discovery_type = 'clinical_trial') as clinical_trials,
  COUNT(*) FILTER (WHERE discovery_type = 'research_paper') as research_papers,
  COUNT(*) FILTER (WHERE discovery_type = 'community_symptom') as community_symptoms,
  COUNT(*) FILTER (WHERE discovery_type = 'ai_correlation') as ai_correlations,
  AVG(credibility_score)::INTEGER as avg_credibility,
  MAX(discovered_at) as latest_discovery
FROM public.discoveries;