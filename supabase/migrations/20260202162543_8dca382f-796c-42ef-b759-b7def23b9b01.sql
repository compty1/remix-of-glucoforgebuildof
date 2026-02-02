-- Create t1d_events table for events
CREATE TABLE IF NOT EXISTS public.t1d_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  organizer TEXT,
  location_name TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'United States',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  cost_info TEXT,
  is_free BOOLEAN DEFAULT false,
  registration_url TEXT,
  website_url TEXT,
  is_virtual BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint for events
CREATE UNIQUE INDEX IF NOT EXISTS t1d_events_title_start_date_unique ON public.t1d_events(title, start_date);

-- Enable RLS on t1d_events
ALTER TABLE public.t1d_events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "T1D events are publicly readable" 
  ON public.t1d_events 
  FOR SELECT 
  USING (true);

-- Create diabetes_organizations table
CREATE TABLE IF NOT EXISTS public.diabetes_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  acronym TEXT,
  purpose TEXT,
  mission_statement TEXT,
  org_type TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  country TEXT,
  annual_revenue BIGINT,
  annual_donations BIGINT,
  executive_compensation JSONB,
  staff_count INTEGER,
  volunteer_count INTEGER,
  current_projects JSONB,
  recent_projects JSONB,
  future_plans TEXT,
  history_summary TEXT,
  notable_achievements TEXT[],
  website_url TEXT,
  donate_url TEXT,
  logo_url TEXT,
  charity_navigator_rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on diabetes_organizations
ALTER TABLE public.diabetes_organizations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Organizations are publicly readable" 
  ON public.diabetes_organizations 
  FOR SELECT 
  USING (true);

-- Add unique constraint to research_items title if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'research_items_title_unique'
  ) THEN
    CREATE UNIQUE INDEX research_items_title_unique ON public.research_items(title);
  END IF;
END $$;