
-- Add ownership column for new community_workarounds rows
ALTER TABLE public.community_workarounds
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS idx_community_workarounds_user_id
  ON public.community_workarounds(user_id);

DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON public.user_subscriptions
  AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role inserts traces" ON public.request_traces;
CREATE POLICY "Service role inserts traces"
  ON public.request_traces FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can insert workarounds" ON public.community_workarounds;
CREATE POLICY "Authenticated users can insert workarounds"
  ON public.community_workarounds FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(message, '')) BETWEEN 1 AND 10000
    AND length(coalesce(name, '')) BETWEEN 1 AND 200
    AND length(coalesce(email, '')) BETWEEN 3 AND 320
  );

DO $$
DECLARE
  fn text;
  internal_fns text[] := ARRAY[
    'update_updated_at_column()',
    'update_device_review_updated_at()',
    'reject_email_display_names()',
    'notify_direct_message()',
    'notify_connection_request()',
    'update_review_helpful_count()',
    'update_medication_review_helpful_count()',
    'update_experience_upvote_count()',
    'update_device_fix_vote_count()',
    'update_story_upvote_count()',
    'update_device_avg_rating()',
    'validate_text_lengths()',
    'recalculate_device_ratings()',
    'recalculate_medication_ratings()',
    'update_trends()',
    'increment_device_review_helpful(uuid)',
    'increment_review_helpful(uuid)',
    'increment_story_upvotes(uuid)',
    'is_admin(uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY internal_fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_device_review_helpful(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_story_upvotes(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.recalculate_device_ratings() FROM authenticated;
REVOKE ALL ON FUNCTION public.recalculate_medication_ratings() FROM authenticated;
REVOKE ALL ON FUNCTION public.update_trends() FROM authenticated;

GRANT EXECUTE ON FUNCTION public.get_glucose_filter_options() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_glucose_summary(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_high_performer_benchmarks() TO anon, authenticated;
