-- Gap 43-46: Create user_alert_preferences table for persisting accessibility settings
CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_budget INTEGER DEFAULT 3,
  burnout_aware BOOLEAN DEFAULT false,
  font_size INTEGER DEFAULT 16,
  reduced_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gap 254: RLS for user_alert_preferences
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alert preferences"
  ON public.user_alert_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert preferences"
  ON public.user_alert_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert preferences"
  ON public.user_alert_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert preferences"
  ON public.user_alert_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);