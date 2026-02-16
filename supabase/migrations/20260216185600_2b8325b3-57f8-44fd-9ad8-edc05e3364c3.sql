
-- Create burnout community posts table
CREATE TABLE public.burnout_community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_anonymous TEXT,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'reddit',
  source_url TEXT,
  burnout_category TEXT,
  topic_tags TEXT[],
  sentiment TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create burnout comments table
CREATE TABLE public.burnout_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.burnout_community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_anonymous TEXT,
  score INTEGER DEFAULT 0,
  parent_comment_id UUID REFERENCES public.burnout_comments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.burnout_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burnout_comments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Burnout posts are publicly readable"
  ON public.burnout_community_posts FOR SELECT USING (true);

CREATE POLICY "Burnout comments are publicly readable"
  ON public.burnout_comments FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_burnout_posts_category ON public.burnout_community_posts(burnout_category);
CREATE INDEX idx_burnout_comments_post_id ON public.burnout_comments(post_id);
