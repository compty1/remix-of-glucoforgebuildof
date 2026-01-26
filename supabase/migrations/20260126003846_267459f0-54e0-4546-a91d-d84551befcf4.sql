-- Add source attribution columns to warrior_stories table
ALTER TABLE public.warrior_stories 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'submission',
ADD COLUMN IF NOT EXISTS original_post_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permission_status TEXT DEFAULT 'public_repost';

-- Add comment to explain columns
COMMENT ON COLUMN public.warrior_stories.source_url IS 'URL to original source content (Reddit post, Instagram, etc.)';
COMMENT ON COLUMN public.warrior_stories.source_type IS 'Type of source: reddit, instagram, facebook, twitter, youtube, submission, interview';
COMMENT ON COLUMN public.warrior_stories.original_post_date IS 'When the original content was posted';
COMMENT ON COLUMN public.warrior_stories.permission_status IS 'public_repost, permission_granted, original_submission';