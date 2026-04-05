
-- Step 1: Create medication_review_helpful_votes table
CREATE TABLE public.medication_review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.medication_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE public.medication_review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can see votes
CREATE POLICY "Anyone can view medication review votes"
  ON public.medication_review_helpful_votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert own votes"
  ON public.medication_review_helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON public.medication_review_helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update medication_reviews.helpful_count
CREATE OR REPLACE FUNCTION public.update_medication_review_helpful_count()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.medication_reviews
    SET helpful_count = COALESCE(helpful_count, 0) + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.medication_reviews
    SET helpful_count = GREATEST(COALESCE(helpful_count, 0) - 1, 0)
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_medication_review_helpful_count
  AFTER INSERT OR DELETE ON public.medication_review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medication_review_helpful_count();
