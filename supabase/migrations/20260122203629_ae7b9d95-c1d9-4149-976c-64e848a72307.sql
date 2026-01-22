-- Phase 9: Donation subscriptions table
CREATE TABLE IF NOT EXISTS public.donation_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  amount_cents INTEGER NOT NULL,
  frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_charge_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 10: User bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmark_type TEXT NOT NULL,
  resource_id TEXT,
  resource_url TEXT NOT NULL,
  resource_title TEXT NOT NULL,
  resource_description TEXT,
  resource_icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, resource_url)
);

-- Phase 11: T1D Events table
CREATE TABLE IF NOT EXISTS public.t1d_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('walk', 'conference', 'support_group', 'fundraiser', 'educational', 'camp', 'meetup', 'virtual')),
  organizer TEXT,
  location_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'United States',
  zip_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  cost_info TEXT,
  is_free BOOLEAN DEFAULT false,
  registration_url TEXT,
  website_url TEXT,
  image_url TEXT,
  is_virtual BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 12: Claimed projects table
CREATE TABLE IF NOT EXISTS public.claimed_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  project_title TEXT NOT NULL,
  claimed_tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
  completed_tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'in_progress', 'submitted', 'completed', 'abandoned')),
  progress INTEGER DEFAULT 0,
  notes TEXT,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on new tables
ALTER TABLE public.donation_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t1d_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimed_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for donation_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.donation_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.donation_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.donation_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON public.user_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.user_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.user_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for t1d_events (public read)
CREATE POLICY "Anyone can view events" 
ON public.t1d_events 
FOR SELECT 
USING (true);

-- RLS policies for claimed_projects
CREATE POLICY "Users can view their own claimed projects" 
ON public.claimed_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claimed projects" 
ON public.claimed_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claimed projects" 
ON public.claimed_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claimed projects" 
ON public.claimed_projects 
FOR DELETE 
USING (auth.uid() = user_id);