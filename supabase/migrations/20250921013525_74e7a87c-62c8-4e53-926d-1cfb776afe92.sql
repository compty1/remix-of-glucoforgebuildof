-- Fix security issues from linter

-- Update function with proper search_path (already set correctly)
-- Enable RLS on onboarding_enrollment table that was missing it
ALTER TABLE public.onboarding_enrollment ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for onboarding_enrollment
CREATE POLICY "Users can view their own onboarding enrollment"
ON public.onboarding_enrollment
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding enrollment"
ON public.onboarding_enrollment
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding enrollment"
ON public.onboarding_enrollment
FOR UPDATE
USING (auth.uid() = user_id);