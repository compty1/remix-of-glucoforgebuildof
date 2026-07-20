
-- 1. Ingestion job state / retry queue
CREATE TABLE IF NOT EXISTS public.ingestion_job_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text UNIQUE NOT NULL,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  consecutive_failures int NOT NULL DEFAULT 0,
  next_run_after timestamptz NOT NULL DEFAULT now(),
  is_paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ingestion_job_state TO authenticated;
GRANT ALL ON public.ingestion_job_state TO service_role;
ALTER TABLE public.ingestion_job_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view ingestion state"
  ON public.ingestion_job_state FOR SELECT
  TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.bump_ingestion_backoff(p_source text, p_error text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fails int;
  delay_seconds int;
BEGIN
  INSERT INTO public.ingestion_job_state (source, last_run_at, last_error, consecutive_failures, next_run_after)
  VALUES (p_source, now(), p_error, 1, now() + interval '2 minutes')
  ON CONFLICT (source) DO UPDATE
  SET last_run_at = now(),
      last_error = EXCLUDED.last_error,
      consecutive_failures = public.ingestion_job_state.consecutive_failures + 1,
      updated_at = now();

  SELECT consecutive_failures INTO fails
  FROM public.ingestion_job_state WHERE source = p_source;

  -- Exponential backoff: 2^fails minutes, capped at 6 hours
  delay_seconds := LEAST(21600, GREATEST(120, (POWER(2, LEAST(fails, 12))::int) * 60));
  UPDATE public.ingestion_job_state
  SET next_run_after = now() + make_interval(secs => delay_seconds)
  WHERE source = p_source;
END;
$$;
REVOKE ALL ON FUNCTION public.bump_ingestion_backoff(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bump_ingestion_backoff(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_ingestion_success(p_source text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.ingestion_job_state (source, last_run_at, last_success_at, consecutive_failures, next_run_after, last_error)
  VALUES (p_source, now(), now(), 0, now(), NULL)
  ON CONFLICT (source) DO UPDATE
  SET last_run_at = now(),
      last_success_at = now(),
      consecutive_failures = 0,
      last_error = NULL,
      next_run_after = now(),
      updated_at = now();
$$;
REVOKE ALL ON FUNCTION public.mark_ingestion_success(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_ingestion_success(text) TO service_role;

-- 2. Per-user ranking preferences
CREATE TABLE IF NOT EXISTS public.user_ranking_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  muted_sources text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ranking_prefs TO authenticated;
GRANT ALL ON public.user_ranking_prefs TO service_role;
ALTER TABLE public.user_ranking_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own ranking prefs"
  ON public.user_ranking_prefs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Shared search result cache
CREATE TABLE IF NOT EXISTS public.search_cache (
  cache_key text PRIMARY KEY,
  query_text text NOT NULL,
  payload jsonb NOT NULL,
  hit_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON public.search_cache(expires_at);
GRANT SELECT ON public.search_cache TO anon, authenticated;
GRANT ALL ON public.search_cache TO service_role;
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fresh cache entries"
  ON public.search_cache FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- 4. Insight moderation reports
DO $$ BEGIN
  CREATE TYPE public.insight_target_type AS ENUM ('discovery', 'discovery_card', 'research_item', 'ai_connection');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.insight_report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.insight_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.insight_target_type NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 100),
  details text CHECK (details IS NULL OR char_length(details) <= 2000),
  status public.insight_report_status NOT NULL DEFAULT 'open',
  resolution_note text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_insight_reports_target ON public.insight_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_insight_reports_status ON public.insight_reports(status);

GRANT SELECT, INSERT, UPDATE ON public.insight_reports TO authenticated;
GRANT ALL ON public.insight_reports TO service_role;
ALTER TABLE public.insight_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own insight reports"
  ON public.insight_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.insight_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all insight reports"
  ON public.insight_reports FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update insight reports"
  ON public.insight_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_insight_reports_updated_at
  BEFORE UPDATE ON public.insight_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_ranking_prefs_updated_at
  BEFORE UPDATE ON public.user_ranking_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_ingestion_job_state_updated_at
  BEFORE UPDATE ON public.ingestion_job_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
