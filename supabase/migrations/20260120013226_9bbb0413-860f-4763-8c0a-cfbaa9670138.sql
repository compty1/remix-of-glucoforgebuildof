-- Add new columns to devices table for comprehensive device information
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS fda_clearance_date DATE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS fda_pma_number TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS fda_510k_number TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS regulatory_class TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS battery_life TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS waterproof_rating TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS sensor_wear_days INTEGER;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS warmup_time TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS accuracy_mard TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS compatibility JSONB;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS app_compatibility JSONB;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS insurance_coverage TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS user_manual_url TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS support_phone TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS support_email TEXT;

-- Add new columns to device_issues table for FDA MAUDE tracking
ALTER TABLE public.device_issues ADD COLUMN IF NOT EXISTS fda_maude_count INTEGER DEFAULT 0;
ALTER TABLE public.device_issues ADD COLUMN IF NOT EXISTS fda_recall_count INTEGER DEFAULT 0;
ALTER TABLE public.device_issues ADD COLUMN IF NOT EXISTS last_fda_update TIMESTAMPTZ;
ALTER TABLE public.device_issues ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.device_issues ADD COLUMN IF NOT EXISTS issue_category TEXT;

-- Create external_device_reviews table for Google/Reddit reviews
CREATE TABLE IF NOT EXISTS public.external_device_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  author_anonymous TEXT,
  rating NUMERIC,
  title TEXT,
  content TEXT NOT NULL,
  sentiment TEXT,
  helpful_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  source_url TEXT,
  device_mentioned TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  subreddit TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);

-- Enable RLS on external_device_reviews
ALTER TABLE public.external_device_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read external device reviews" 
ON public.external_device_reviews 
FOR SELECT 
USING (true);