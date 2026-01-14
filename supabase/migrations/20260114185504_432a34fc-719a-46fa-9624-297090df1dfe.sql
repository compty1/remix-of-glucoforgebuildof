-- Add read policy for email_digest_logs (admin-only via edge function, public read for transparency)
CREATE POLICY "Anyone can view digest logs"
  ON public.email_digest_logs FOR SELECT
  USING (true);