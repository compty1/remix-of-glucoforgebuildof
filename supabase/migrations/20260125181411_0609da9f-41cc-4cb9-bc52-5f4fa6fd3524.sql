-- Create table for T1D history timeline events
CREATE TABLE public.t1d_history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  year_end INTEGER,
  era TEXT,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  image_url TEXT,
  image_caption TEXT,
  sources TEXT[],
  interesting_facts TEXT[],
  impact_score INTEGER DEFAULT 5,
  decade TEXT,
  decade_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.t1d_history_events ENABLE ROW LEVEL SECURITY;

-- Public read access for history events
CREATE POLICY "Public read access for history events"
  ON public.t1d_history_events FOR SELECT TO public USING (true);

-- Create table for experience submissions (Your Experience page)
CREATE TABLE public.experience_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('good', 'bad', 'daily_tasks', 'fears', 'embarrassing_lows')),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experience_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for approved submissions
CREATE POLICY "Public read approved submissions"
  ON public.experience_submissions FOR SELECT TO public 
  USING (is_approved = true);

-- Authenticated users can insert their own submissions
CREATE POLICY "Authenticated users can submit"
  ON public.experience_submissions FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can update own submissions
CREATE POLICY "Users update own submissions"
  ON public.experience_submissions FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Users can delete own submissions
CREATE POLICY "Users delete own submissions"
  ON public.experience_submissions FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);