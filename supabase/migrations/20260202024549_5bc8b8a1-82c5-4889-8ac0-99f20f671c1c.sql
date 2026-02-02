-- Add missing column for warrior stories
ALTER TABLE warrior_stories 
ADD COLUMN IF NOT EXISTS source_link_verified boolean DEFAULT false;