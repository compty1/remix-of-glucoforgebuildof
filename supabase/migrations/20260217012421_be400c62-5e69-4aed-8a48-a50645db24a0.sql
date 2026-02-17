
-- Add new columns to adult_content_posts for enhanced filtering and content types
ALTER TABLE public.adult_content_posts 
ADD COLUMN IF NOT EXISTS topic_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sentiment text DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS confidence_score double precision DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'post',
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'reddit';

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_adult_content_posts_category ON public.adult_content_posts(category);
CREATE INDEX IF NOT EXISTS idx_adult_content_posts_post_type ON public.adult_content_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_adult_content_posts_is_featured ON public.adult_content_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_adult_content_posts_sentiment ON public.adult_content_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_adult_content_posts_topic_tags ON public.adult_content_posts USING GIN(topic_tags);
