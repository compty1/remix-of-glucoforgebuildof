-- Add url column for linking to original posts
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS url text;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_url 
ON community_posts(url);