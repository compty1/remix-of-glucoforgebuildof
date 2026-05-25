ALTER TABLE public.discoveries
  ADD COLUMN IF NOT EXISTS is_ai_synthesized BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.medical_research_papers
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_medical_research_papers_content_hash
  ON public.medical_research_papers (content_hash)
  WHERE content_hash IS NOT NULL;

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_community_posts_archived
  ON public.community_posts (is_archived, published_at DESC);