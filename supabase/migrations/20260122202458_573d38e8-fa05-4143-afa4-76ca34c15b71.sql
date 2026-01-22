-- Add product_image_url column to t1d_companies for device/product images
ALTER TABLE public.t1d_companies
ADD COLUMN IF NOT EXISTS product_image_url TEXT;

-- Add community_testimonials and related columns to quality_of_life_resources
ALTER TABLE public.quality_of_life_resources
ADD COLUMN IF NOT EXISTS community_testimonials JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS success_stories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS user_tips TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create diabetes_organizations table
CREATE TABLE IF NOT EXISTS public.diabetes_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  acronym TEXT,
  purpose TEXT,
  mission_statement TEXT,
  org_type TEXT CHECK (org_type IN ('research', 'advocacy', 'support', 'education', 'hybrid', 'foundation')),
  founded_year INTEGER,
  headquarters TEXT,
  country TEXT DEFAULT 'United States',
  annual_revenue NUMERIC,
  annual_donations NUMERIC,
  executive_compensation JSONB DEFAULT '{}'::jsonb,
  staff_count INTEGER,
  volunteer_count INTEGER,
  current_projects JSONB DEFAULT '[]'::jsonb,
  recent_projects JSONB DEFAULT '[]'::jsonb,
  future_plans TEXT,
  history_summary TEXT,
  notable_achievements JSONB DEFAULT '[]'::jsonb,
  website_url TEXT,
  donate_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  charity_navigator_rating NUMERIC,
  guidestar_rating TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create advocate_applications table
CREATE TABLE IF NOT EXISTS public.advocate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'United States',
  zip_code TEXT,
  personal_story TEXT,
  diagnosis_year INTEGER,
  connection_to_t1d TEXT CHECK (connection_to_t1d IN ('self', 'child', 'family_member', 'friend', 'healthcare_provider', 'other')),
  advocacy_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability TEXT,
  prior_advocacy_experience TEXT,
  how_heard_about TEXT,
  consent_to_contact BOOLEAN DEFAULT false,
  consent_to_share_story BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive')),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create medication_community_buzz table for social media posts
CREATE TABLE IF NOT EXISTS public.medication_community_buzz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  post_content TEXT NOT NULL,
  author_handle TEXT,
  post_date TIMESTAMPTZ,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  engagement_score INTEGER DEFAULT 0,
  post_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.diabetes_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advocate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_community_buzz ENABLE ROW LEVEL SECURITY;

-- RLS policies for diabetes_organizations (public read)
CREATE POLICY "Anyone can view organizations" 
ON public.diabetes_organizations 
FOR SELECT 
USING (true);

-- RLS policies for advocate_applications
CREATE POLICY "Users can view their own applications" 
ON public.advocate_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.advocate_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.advocate_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for medication_community_buzz (public read)
CREATE POLICY "Anyone can view medication community buzz" 
ON public.medication_community_buzz 
FOR SELECT 
USING (true);