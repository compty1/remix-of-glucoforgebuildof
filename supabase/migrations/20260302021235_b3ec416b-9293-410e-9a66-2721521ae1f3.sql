-- Phase 10: Database Optimization

-- 10.1: B-Tree Indexes on user_id foreign keys
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_user_id ON public.device_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_device_id ON public.device_reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_claimed_projects_user_id ON public.claimed_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_from ON public.connection_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_to ON public.connection_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_user_id ON public.shop_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_stripe_session ON public.shop_orders(stripe_session_id);

-- 10.1: Indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_community_posts_source ON public.community_posts(source);
CREATE INDEX IF NOT EXISTS idx_community_posts_sentiment ON public.community_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON public.community_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_devices_category ON public.devices(category);
CREATE INDEX IF NOT EXISTS idx_devices_manufacturer ON public.devices(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_issues_device_id ON public.device_issues(device_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON public.clinical_trials_detailed(overall_status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_phase ON public.clinical_trials_detailed(phase);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_cure_therapies_phase ON public.cure_therapies(phase);
CREATE INDEX IF NOT EXISTS idx_cure_therapies_status ON public.cure_therapies(status);

-- 10.2: GIN index for topic_tags array search
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON public.community_posts USING GIN(topic_tags);

-- 10.9: Ensure TIMESTAMPTZ consistency (add default now() where missing)
-- These are safe ALTER statements that add defaults without breaking existing data
ALTER TABLE public.community_posts ALTER COLUMN fetched_at SET DEFAULT now();
ALTER TABLE public.contact_submissions ALTER COLUMN created_at SET DEFAULT now();

-- 10.5: VARCHAR constraints on critical fields (via check constraints as validation triggers)
-- Add length validation trigger for critical text fields
CREATE OR REPLACE FUNCTION public.validate_text_lengths()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate title lengths where applicable
  IF TG_TABLE_NAME = 'community_posts' AND length(NEW.title) > 500 THEN
    RAISE EXCEPTION 'Title exceeds maximum length of 500 characters';
  END IF;
  
  IF TG_TABLE_NAME = 'articles' AND length(NEW.title) > 300 THEN
    RAISE EXCEPTION 'Article title exceeds maximum length of 300 characters';
  END IF;
  
  IF TG_TABLE_NAME = 'contact_submissions' AND length(NEW.message) > 10000 THEN
    RAISE EXCEPTION 'Message exceeds maximum length of 10,000 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation triggers
DROP TRIGGER IF EXISTS validate_community_posts_text ON public.community_posts;
CREATE TRIGGER validate_community_posts_text
  BEFORE INSERT OR UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_text_lengths();

DROP TRIGGER IF EXISTS validate_articles_text ON public.articles;
CREATE TRIGGER validate_articles_text
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.validate_text_lengths();

DROP TRIGGER IF EXISTS validate_contact_text ON public.contact_submissions;
CREATE TRIGGER validate_contact_text
  BEFORE INSERT OR UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.validate_text_lengths();