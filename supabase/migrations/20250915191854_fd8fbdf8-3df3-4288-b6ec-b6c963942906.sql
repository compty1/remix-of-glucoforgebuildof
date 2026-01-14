-- Create device_metrics table for community-sourced reliability data (if not exists)
CREATE TABLE IF NOT EXISTS public.device_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  reliability_score INTEGER NOT NULL CHECK (reliability_score >= 0 AND reliability_score <= 100),
  social_setting_score INTEGER NOT NULL CHECK (social_setting_score >= 0 AND social_setting_score <= 100),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device_issues table for tracking common problems and solutions (if not exists)
CREATE TABLE IF NOT EXISTS public.device_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  issue_title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  frequency_percentage INTEGER NOT NULL CHECK (frequency_percentage >= 0 AND frequency_percentage <= 100),
  solution TEXT,
  workaround TEXT,
  source_url TEXT,
  community_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_posts table for caching Reddit data (if not exists)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  author_anonymous TEXT, -- Anonymized author reference
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  device_mentioned TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source, post_id)
);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Devices are viewable by everyone" ON public.devices;
DROP POLICY IF EXISTS "Device metrics are viewable by everyone" ON public.device_metrics;
DROP POLICY IF EXISTS "Device issues are viewable by everyone" ON public.device_issues;
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON public.community_posts;

-- Create public read-access policies
CREATE POLICY "Devices are viewable by everyone" 
ON public.devices 
FOR SELECT 
USING (true);

CREATE POLICY "Device metrics are viewable by everyone" 
ON public.device_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "Device issues are viewable by everyone" 
ON public.device_issues 
FOR SELECT 
USING (true);

CREATE POLICY "Community posts are viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_devices_category ON public.devices(category);
CREATE INDEX IF NOT EXISTS idx_devices_manufacturer ON public.devices(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_id ON public.device_metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_device_issues_device_id ON public.device_issues(device_id);
CREATE INDEX IF NOT EXISTS idx_device_issues_severity ON public.device_issues(severity);
CREATE INDEX IF NOT EXISTS idx_community_posts_source ON public.community_posts(source);
CREATE INDEX IF NOT EXISTS idx_community_posts_device_mentioned ON public.community_posts(device_mentioned);
CREATE INDEX IF NOT EXISTS idx_community_posts_published_at ON public.community_posts(published_at DESC);

-- Create triggers for updating timestamps (safe to run multiple times)
DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_issues_updated_at ON public.device_issues;
CREATE TRIGGER update_device_issues_updated_at
BEFORE UPDATE ON public.device_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();