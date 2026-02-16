
-- Create diabetic_profiles table for opt-in user discovery
CREATE TABLE public.diabetic_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  diagnosis_year INT,
  device_setup TEXT,
  looking_for TEXT[],
  bio_snippet TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diabetic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible profiles"
  ON public.diabetic_profiles FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can insert their own profile"
  ON public.diabetic_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.diabetic_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.diabetic_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own hidden profile"
  ON public.diabetic_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_diabetic_profiles_updated_at
  BEFORE UPDATE ON public.diabetic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create t1d_community_directory table
CREATE TABLE public.t1d_community_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT,
  state TEXT,
  region TEXT,
  url TEXT NOT NULL,
  is_national BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.t1d_community_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for community directory"
  ON public.t1d_community_directory FOR SELECT
  USING (true);

-- Create connection_requests table
CREATE TABLE public.connection_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own sent requests"
  ON public.connection_requests FOR SELECT
  USING (auth.uid() = from_user_id);

CREATE POLICY "Users can read requests sent to them"
  ON public.connection_requests FOR SELECT
  USING (auth.uid() = to_user_id);

CREATE POLICY "Users can create connection requests"
  ON public.connection_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update requests sent to them"
  ON public.connection_requests FOR UPDATE
  USING (auth.uid() = to_user_id);
