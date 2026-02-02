-- =============================================
-- RLS Security Fixes Migration (Corrected)
-- Fix overly permissive INSERT policies
-- =============================================

-- 1. community_comments - This table uses author_anonymous (not user_id)
-- The current policy allowing authenticated users is acceptable for anonymous posting
-- Adding rate limiting would require application logic, so we'll keep the policy
-- but mark it as intentional for anonymous community posts

-- 2. Fix notifications table
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Service role for edge functions/triggers (system notifications)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can only create notifications for themselves
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Fix volunteer_interests table (no user_id column - public form)
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit volunteer interest" ON public.volunteer_interests;

-- For anonymous submissions - requires valid email
CREATE POLICY "Anonymous users can submit volunteer interest with email"
ON public.volunteer_interests
FOR INSERT
TO anon
WITH CHECK (
  email IS NOT NULL 
  AND email <> ''
);

-- For authenticated users - also requires email (form validation)
CREATE POLICY "Authenticated users can submit volunteer interest"
ON public.volunteer_interests
FOR INSERT
TO authenticated
WITH CHECK (
  email IS NOT NULL 
  AND email <> ''
);