-- Push notification subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Add push_enabled column to notification_preferences if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_preferences' 
    AND column_name = 'push_enabled') THEN
    ALTER TABLE public.notification_preferences ADD COLUMN push_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;