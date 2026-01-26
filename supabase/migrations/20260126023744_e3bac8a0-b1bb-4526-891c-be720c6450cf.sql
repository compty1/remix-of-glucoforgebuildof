-- =============================================
-- PHASE 1: Achievement & Gamification System
-- =============================================

-- 1.1 User Achievements Table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  category TEXT, -- 'data', 'community', 'research', 'engagement'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- 1.2 User Streaks Table
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL, -- 'tir_70', 'survey', 'platform_visit', 'data_upload'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- 1.3 User Milestones Table
CREATE TABLE public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL, -- 'diagnosis_anniversary', 'device_upgrade', 'join_date'
  milestone_date DATE,
  title TEXT,
  description TEXT,
  remind_me BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 User Preferences Table (for personalization)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  diagnosis_year INTEGER,
  therapy_type TEXT, -- 'mdi', 'pump', 'hybrid_closed_loop'
  primary_challenges TEXT[], -- ['hypos', 'highs', 'variability', 'burnout']
  device_brands TEXT[], -- ['dexcom', 'omnipod', 'tandem']
  content_interests TEXT[], -- ['research', 'community', 'practical_tips', 'mental_health']
  cgm_device_id UUID,
  pump_device_id UUID,
  primary_medication_id UUID,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.5 User Follows Table (social features)
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  follow_type TEXT NOT NULL, -- 'user', 'topic', 'researcher', 'device', 'therapy'
  followed_id TEXT NOT NULL, -- UUID or topic name
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, follow_type, followed_id)
);

-- 1.6 Community Challenges Tables
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT, -- 'logging', 'sharing', 'reading', 'community'
  start_date DATE,
  end_date DATE,
  reward_badge_id TEXT,
  reward_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- 1.7 Notifications Tables
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'achievement', 'milestone', 'research', 'community', 'device', 'fda_alert', 'challenge'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_frequency TEXT DEFAULT 'weekly', -- 'realtime', 'daily', 'weekly', 'never'
  in_app_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  categories JSONB DEFAULT '{"research": true, "community": true, "device": true, "personal": true, "achievements": true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.8 User View History (for recently viewed)
CREATE TABLE public.user_view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'device', 'medication', 'article', 'research', 'community_post'
  item_id TEXT NOT NULL,
  item_title TEXT,
  item_url TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- 1.9 Add avg_rating to devices table
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- =============================================
-- Enable RLS on all new tables
-- =============================================

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_view_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- User Achievements: Users can view/manage their own
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- User Streaks: Users can view/manage their own
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- User Milestones: Users can view/manage their own
CREATE POLICY "Users can view their own milestones" ON public.user_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON public.user_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.user_milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestones" ON public.user_milestones FOR DELETE USING (auth.uid() = user_id);

-- User Preferences: Users can view/manage their own
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User Follows: Users can view/manage their own follows
CREATE POLICY "Users can view their own follows" ON public.user_follows FOR SELECT USING (auth.uid() = follower_id);
CREATE POLICY "Users can insert their own follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Community Challenges: Public read, authenticated users can participate
CREATE POLICY "Anyone can view challenges" ON public.community_challenges FOR SELECT USING (true);

-- Challenge Participants: Users can view/manage their own participation
CREATE POLICY "Users can view their own participation" ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: Users can view/manage their own
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Notification Preferences: Users can view/manage their own
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User View History: Users can view/manage their own
CREATE POLICY "Users can view their own history" ON public.user_view_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history" ON public.user_view_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own history" ON public.user_view_history FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Seed Initial Community Challenges
-- =============================================

INSERT INTO public.community_challenges (title, description, challenge_type, start_date, end_date, reward_badge_id, reward_points, is_active) VALUES
('30 Days of Logging', 'Log your glucose data for 30 consecutive days and earn the Data Pioneer badge!', 'logging', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'data_pioneer', 100, true),
('Share Your Low Hack', 'Share your best tip for handling low blood sugar with the community', 'sharing', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'community_helper', 50, true),
('Research Reading Week', 'Read and save 5 research articles this week', 'reading', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'knowledge_seeker', 75, true),
('Community Welcome Committee', 'Welcome 3 new members to the community with helpful comments', 'community', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'community_champion', 60, true);

-- =============================================
-- Create function to update device avg_rating
-- =============================================

CREATE OR REPLACE FUNCTION public.update_device_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices
  SET 
    avg_rating = (SELECT AVG(rating) FROM public.device_reviews WHERE device_id = COALESCE(NEW.device_id, OLD.device_id)),
    review_count = (SELECT COUNT(*) FROM public.device_reviews WHERE device_id = COALESCE(NEW.device_id, OLD.device_id))
  WHERE id = COALESCE(NEW.device_id, OLD.device_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for device reviews
DROP TRIGGER IF EXISTS trigger_update_device_avg_rating ON public.device_reviews;
CREATE TRIGGER trigger_update_device_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON public.device_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_device_avg_rating();