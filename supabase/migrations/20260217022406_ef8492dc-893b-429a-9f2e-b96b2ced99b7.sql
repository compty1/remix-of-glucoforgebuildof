
-- Create adult_content_comments table
CREATE TABLE public.adult_content_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.adult_content_posts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES public.adult_content_comments(id) ON DELETE CASCADE,
  author_anonymous text,
  content text NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by post
CREATE INDEX idx_adult_content_comments_post_id ON public.adult_content_comments(post_id);

-- Enable RLS
ALTER TABLE public.adult_content_comments ENABLE ROW LEVEL SECURITY;

-- Public read access (matches adult_content_posts policy)
CREATE POLICY "Anyone can read adult content comments"
  ON public.adult_content_comments
  FOR SELECT
  USING (true);
