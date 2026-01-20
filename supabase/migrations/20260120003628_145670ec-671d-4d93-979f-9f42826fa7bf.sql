-- Create table for AI-discovered connections
CREATE TABLE public.ai_found_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('food', 'biology', 'device', 'chemical', 'environmental', 'symptom', 'treatment')),
  
  -- Evidence and sources
  source_papers JSONB DEFAULT '[]',
  source_posts JSONB DEFAULT '[]',
  source_trials JSONB DEFAULT '[]',
  source_fda_data JSONB DEFAULT '[]',
  
  -- Scoring
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  novelty_score INTEGER DEFAULT 0 CHECK (novelty_score >= 0 AND novelty_score <= 100),
  community_mentions INTEGER DEFAULT 0,
  research_citations INTEGER DEFAULT 0,
  
  -- Validation
  validation_status TEXT DEFAULT 'hypothesis' CHECK (validation_status IN ('confirmed', 'emerging', 'hypothesis')),
  cross_validation_count INTEGER DEFAULT 0,
  
  -- Content
  biological_mechanism TEXT,
  practical_implications TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Analysis metadata
  ai_analysis JSONB,
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_found_connections ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read connections" ON public.ai_found_connections
  FOR SELECT USING (true);

-- Create index for search
CREATE INDEX idx_ai_found_connections_type ON public.ai_found_connections(connection_type);
CREATE INDEX idx_ai_found_connections_confidence ON public.ai_found_connections(confidence_score DESC);
CREATE INDEX idx_ai_found_connections_novelty ON public.ai_found_connections(novelty_score DESC);
CREATE INDEX idx_ai_found_connections_keywords ON public.ai_found_connections USING GIN(keywords);

-- Add updated_at trigger
CREATE TRIGGER update_ai_found_connections_updated_at
  BEFORE UPDATE ON public.ai_found_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();