-- Add medical profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS diagnosis_date date,
ADD COLUMN IF NOT EXISTS primary_cgm text,
ADD COLUMN IF NOT EXISTS insulin_delivery text,
ADD COLUMN IF NOT EXISTS research_participation boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"glucoseAlerts":true,"researchUpdates":false,"communityPosts":true,"deviceAlerts":true,"weeklyReports":true}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"dataSharing":false,"anonymousAnalytics":true,"publicProfile":false,"researchParticipation":true}'::jsonb;