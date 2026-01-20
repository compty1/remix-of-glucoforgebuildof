-- Create volunteer_interests table
CREATE TABLE public.volunteer_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  roles TEXT[] NOT NULL,
  skills TEXT,
  availability TEXT,
  portfolio_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.volunteer_interests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit volunteer interest (public form)
CREATE POLICY "Anyone can submit volunteer interest" 
  ON public.volunteer_interests 
  FOR INSERT 
  WITH CHECK (true);

-- Only admins can view volunteer interests
CREATE POLICY "Admins can view volunteer interests" 
  ON public.volunteer_interests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );