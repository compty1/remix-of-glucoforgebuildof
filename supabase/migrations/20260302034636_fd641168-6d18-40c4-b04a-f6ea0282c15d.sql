
-- Wave 2.2: Reject display names containing @ (PII protection)
CREATE OR REPLACE FUNCTION public.reject_email_display_names()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.display_name IS NOT NULL AND NEW.display_name LIKE '%@%' THEN
    NEW.display_name := 'User';
  END IF;
  RETURN NEW;
END;
$$;

-- Only create trigger if profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS enforce_no_email_display_name ON public.profiles;
    CREATE TRIGGER enforce_no_email_display_name
      BEFORE INSERT OR UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.reject_email_display_names();
  END IF;
END $$;

-- Wave 2.2: Scrub existing PII from display names
UPDATE public.profiles
SET display_name = 'User'
WHERE display_name LIKE '%@%';

-- Wave 4.3: Cron overlap protection table
CREATE TABLE IF NOT EXISTS public.cron_locks (
  lock_name TEXT PRIMARY KEY,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acquired_by TEXT
);

ALTER TABLE public.cron_locks ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage cron locks
CREATE POLICY "Service role manages cron locks"
  ON public.cron_locks
  FOR ALL
  USING (false)
  WITH CHECK (false);
