-- Create data refresh logs table for tracking orchestration runs
CREATE TABLE IF NOT EXISTS public.data_refresh_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refresh_type TEXT NOT NULL DEFAULT 'scheduled',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  records_fetched INTEGER DEFAULT 0,
  functions_succeeded INTEGER DEFAULT 0,
  functions_failed INTEGER DEFAULT 0,
  error_message TEXT,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying recent refreshes
CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_started_at 
ON public.data_refresh_logs(started_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_status 
ON public.data_refresh_logs(status);

-- Enable RLS
ALTER TABLE public.data_refresh_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (view refresh history)
CREATE POLICY "Users can view data refresh logs" 
ON public.data_refresh_logs 
FOR SELECT 
USING (true);

-- Only service role can insert/update (from edge functions)
CREATE POLICY "Service role can manage data refresh logs" 
ON public.data_refresh_logs 
FOR ALL 
USING (auth.role() = 'service_role');

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP calls from cron
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily data orchestrator at 2 AM UTC
SELECT cron.schedule(
  'daily-data-orchestrator',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://meucptevbewkcipbtxih.supabase.co/functions/v1/data-orchestrator',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldWNwdGV2YmV3a2NpcGJ0eGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDU5MzksImV4cCI6MjA4Mzk4MTkzOX0.-lmuZZxko1y1jEVh8GILMVN5-JG4GX4xoGiP7Rk0c4k'
      ),
      body := jsonb_build_object('scheduled', true, 'trigger', 'pg_cron')
    ) AS request_id;
  $$
);