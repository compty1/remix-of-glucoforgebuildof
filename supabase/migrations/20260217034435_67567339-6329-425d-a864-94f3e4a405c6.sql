
-- Part 12: Atomic upvote increment for low blood sugar stories
CREATE OR REPLACE FUNCTION public.increment_story_upvotes(story_id UUID)
RETURNS void AS $$
  UPDATE public.low_blood_sugar_stories 
  SET upvotes = COALESCE(upvotes, 0) + 1 
  WHERE id = story_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Part 29: Atomic helpful increment for medication reviews
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id UUID)
RETURNS void AS $$
  UPDATE public.medication_reviews 
  SET helpful_count = COALESCE(helpful_count, 0) + 1 
  WHERE id = review_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Part 30: Atomic helpful increment for device reviews
CREATE OR REPLACE FUNCTION public.increment_device_review_helpful(review_id UUID)
RETURNS void AS $$
  UPDATE public.device_reviews 
  SET helpful_count = COALESCE(helpful_count, 0) + 1 
  WHERE id = review_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Issue 156: Contact form submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read contact submissions (via service role or admin check)
CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Issue 31: Normalize external_device_reviews source names
UPDATE public.external_device_reviews SET source = 'Reddit' WHERE source = 'reddit';
