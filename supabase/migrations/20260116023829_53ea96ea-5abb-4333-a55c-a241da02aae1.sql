-- User device reviews table
CREATE TABLE public.device_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  pros text[] DEFAULT '{}',
  cons text[] DEFAULT '{}',
  ownership_duration text,
  verified_owner boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(device_id, user_id)
);

-- Helpful votes tracking table
CREATE TABLE public.review_helpful_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.device_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.device_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Policies for device_reviews
CREATE POLICY "Anyone can read reviews"
  ON public.device_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.device_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.device_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.device_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for helpful votes
CREATE POLICY "Anyone can read votes"
  ON public.review_helpful_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes"
  ON public.review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update helpful_count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.device_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.device_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update helpful_count
CREATE TRIGGER update_helpful_count_trigger
  AFTER INSERT OR DELETE ON public.review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_device_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER update_device_reviews_updated_at
  BEFORE UPDATE ON public.device_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_device_review_updated_at();