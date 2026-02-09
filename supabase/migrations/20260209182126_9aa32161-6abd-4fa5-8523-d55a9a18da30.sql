
-- Step 1: Add provenance and quality columns to community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS raw_payload_hash TEXT NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS link_status JSONB NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION NULL;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS quarantined BOOLEAN DEFAULT FALSE;

-- Step 2: Create quarantine table
CREATE TABLE IF NOT EXISTS post_quarantine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NULL,
  raw_payload JSONB NOT NULL,
  validation_errors JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer TEXT NULL,
  review_notes TEXT NULL
);

ALTER TABLE post_quarantine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read quarantine"
  ON post_quarantine FOR SELECT USING (true);

-- Step 3: Create backfill audit table
CREATE TABLE IF NOT EXISTS backfill_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  performed_by TEXT NOT NULL DEFAULT 'system',
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT NULL
);

ALTER TABLE backfill_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read audit"
  ON backfill_audit FOR SELECT USING (true);

-- Step 4: Add indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_quarantined ON community_posts (quarantined);
CREATE INDEX IF NOT EXISTS idx_community_posts_confidence ON community_posts (confidence_score);
CREATE INDEX IF NOT EXISTS idx_community_posts_link_status ON community_posts USING gin (link_status);
CREATE INDEX IF NOT EXISTS idx_community_posts_hash ON community_posts (raw_payload_hash);
CREATE INDEX IF NOT EXISTS idx_post_quarantine_received ON post_quarantine (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_quarantine_reviewed ON post_quarantine (reviewed);
CREATE INDEX IF NOT EXISTS idx_backfill_audit_post ON backfill_audit (post_id);
