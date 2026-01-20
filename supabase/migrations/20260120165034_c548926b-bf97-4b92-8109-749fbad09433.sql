-- Create table for T1D news articles
CREATE TABLE public.t1d_news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  source_name TEXT,
  source_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  category TEXT DEFAULT 'general', -- 'research', 'technology', 'treatment', 'lifestyle', 'advocacy', 'general'
  relevance_score INTEGER DEFAULT 50,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.t1d_news_articles ENABLE ROW LEVEL SECURITY;

-- Public read access (news is public content)
CREATE POLICY "Anyone can read news articles" 
  ON public.t1d_news_articles FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_t1d_news_published_at ON public.t1d_news_articles(published_at DESC);
CREATE INDEX idx_t1d_news_category ON public.t1d_news_articles(category);
CREATE INDEX idx_t1d_news_featured ON public.t1d_news_articles(is_featured) WHERE is_featured = true;

-- Add trigger for updated_at
CREATE TRIGGER update_t1d_news_updated_at
  BEFORE UPDATE ON public.t1d_news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();