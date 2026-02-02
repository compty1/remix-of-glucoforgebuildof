-- Add missing column for warrior stories verified_at timestamp
ALTER TABLE warrior_stories 
ADD COLUMN IF NOT EXISTS source_link_verified_at timestamp with time zone DEFAULT null;