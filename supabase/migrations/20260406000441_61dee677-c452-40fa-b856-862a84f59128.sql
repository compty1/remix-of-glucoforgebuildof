
-- Phase 2: Vote tracking tables for stories, experiences, and device fixes
-- Bug 1, 81-87, 195

-- 1. Story upvote tracking
CREATE TABLE public.story_upvote_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.low_blood_sugar_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_upvote_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all story votes" ON public.story_upvote_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own story votes" ON public.story_upvote_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own story votes" ON public.story_upvote_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to update story upvote count
CREATE OR REPLACE FUNCTION public.update_story_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.low_blood_sugar_stories
    SET upvotes = COALESCE(upvotes, 0) + 1
    WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.low_blood_sugar_stories
    SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0)
    WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_story_upvote_count
AFTER INSERT OR DELETE ON public.story_upvote_votes
FOR EACH ROW EXECUTE FUNCTION public.update_story_upvote_count();

-- 2. Experience upvote tracking
CREATE TABLE public.experience_upvote_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.experience_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

ALTER TABLE public.experience_upvote_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all experience votes" ON public.experience_upvote_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own experience votes" ON public.experience_upvote_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own experience votes" ON public.experience_upvote_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_experience_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experience_submissions
    SET upvotes = COALESCE(upvotes, 0) + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experience_submissions
    SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0)
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_experience_upvote_count
AFTER INSERT OR DELETE ON public.experience_upvote_votes
FOR EACH ROW EXECUTE FUNCTION public.update_experience_upvote_count();

-- 3. Device fix vote tracking
CREATE TABLE public.device_fix_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fix_id UUID NOT NULL REFERENCES public.device_user_fixes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fix_id, user_id)
);

ALTER TABLE public.device_fix_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all fix votes" ON public.device_fix_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own fix votes" ON public.device_fix_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fix votes" ON public.device_fix_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_device_fix_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.device_user_fixes
    SET votes = COALESCE(votes, 0) + 1
    WHERE id = NEW.fix_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.device_user_fixes
    SET votes = GREATEST(COALESCE(votes, 0) - 1, 0)
    WHERE id = OLD.fix_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_device_fix_vote_count
AFTER INSERT OR DELETE ON public.device_fix_votes
FOR EACH ROW EXECUTE FUNCTION public.update_device_fix_vote_count();
