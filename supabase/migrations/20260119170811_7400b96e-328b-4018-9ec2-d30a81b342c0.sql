-- Add new columns to community_posts for enhanced search and topic detection
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS topic_tags text[] DEFAULT '{}';

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS is_solution boolean DEFAULT false;

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'post';

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS parent_post_id text;

-- Create GIN index for full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_community_posts_search 
ON community_posts USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Create GIN index for topic filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_topics 
ON community_posts USING gin(topic_tags);

-- Create index for device filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_device 
ON community_posts(device_mentioned);

-- Create index for sentiment filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_sentiment 
ON community_posts(sentiment);

-- Create index for post_type
CREATE INDEX IF NOT EXISTS idx_community_posts_type 
ON community_posts(post_type);

-- Create index for score (trending)
CREATE INDEX IF NOT EXISTS idx_community_posts_score 
ON community_posts(score DESC);