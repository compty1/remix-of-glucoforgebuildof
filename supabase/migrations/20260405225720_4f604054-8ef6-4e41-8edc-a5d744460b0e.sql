
CREATE TABLE public.meal_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, meal_type TEXT, food_name TEXT NOT NULL, carbs_grams NUMERIC, protein_grams NUMERIC, fat_grams NUMERIC, calories NUMERIC, barcode TEXT, notes TEXT, logged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.supply_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, supply_type TEXT NOT NULL, brand TEXT, lot_number TEXT, expiration_date DATE, quantity INTEGER DEFAULT 1, scanned_via TEXT, notes TEXT, logged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.exercise_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, exercise_type TEXT NOT NULL, duration_minutes INTEGER, intensity TEXT, calories_burned NUMERIC, glucose_before NUMERIC, glucose_after NUMERIC, notes TEXT, logged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.mood_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, mood TEXT NOT NULL, energy_level INTEGER, stress_level INTEGER, sleep_hours NUMERIC, notes TEXT, logged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.lab_results (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, test_type TEXT NOT NULL, value NUMERIC NOT NULL, unit TEXT, reference_range TEXT, lab_name TEXT, notes TEXT, test_date DATE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.appointment_reminders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, title TEXT NOT NULL, provider_name TEXT, location TEXT, appointment_date TIMESTAMPTZ NOT NULL, reminder_minutes_before INTEGER DEFAULT 60, is_completed BOOLEAN DEFAULT false, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.medication_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, medication_name TEXT NOT NULL, dose_amount NUMERIC NOT NULL, dose_unit TEXT DEFAULT 'units', route TEXT, injection_site TEXT, notes TEXT, logged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.site_rotation_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, site_name TEXT NOT NULL, device_type TEXT, applied_at TIMESTAMPTZ NOT NULL DEFAULT now(), removed_at TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.volunteer_signups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT NOT NULL, email TEXT NOT NULL, interests TEXT[], availability TEXT, experience TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.post_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reporter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, post_id TEXT NOT NULL, post_type TEXT NOT NULL DEFAULT 'community', reason TEXT NOT NULL, details TEXT, status TEXT DEFAULT 'pending', reviewed_at TIMESTAMPTZ, reviewed_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.search_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, query TEXT NOT NULL, result_count INTEGER, search_type TEXT DEFAULT 'global', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.page_views (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, page_path TEXT NOT NULL, referrer TEXT, duration_seconds INTEGER, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.saved_scenarios (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, title TEXT NOT NULL, scenario_data JSONB NOT NULL DEFAULT '{}'::jsonb, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.burnout_scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, score NUMERIC NOT NULL, category TEXT, contributing_factors TEXT[], notes TEXT, assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.alert_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, alert_type TEXT NOT NULL, alert_message TEXT, was_delivered BOOLEAN DEFAULT true, was_suppressed BOOLEAN DEFAULT false, suppression_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Indexes on existing tables (correct column names)
CREATE INDEX IF NOT EXISTS idx_community_posts_published_at ON public.community_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_uploads_user_uploaded ON public.uploads(user_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_research_papers_created ON public.medical_research_papers(created_at DESC);

-- Indexes on new tables
CREATE INDEX idx_meal_logs_user ON public.meal_logs(user_id, logged_at DESC);
CREATE INDEX idx_exercise_logs_user ON public.exercise_logs(user_id, logged_at DESC);
CREATE INDEX idx_mood_logs_user ON public.mood_logs(user_id, logged_at DESC);
CREATE INDEX idx_medication_logs_user ON public.medication_logs(user_id, logged_at DESC);
CREATE INDEX idx_lab_results_user ON public.lab_results(user_id, test_date DESC);
CREATE INDEX idx_alert_history_user ON public.alert_history(user_id, created_at DESC);
CREATE INDEX idx_burnout_scores_user ON public.burnout_scores(user_id, assessed_at DESC);
CREATE INDEX idx_search_history_user ON public.search_history(user_id, created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(page_path, created_at DESC);
CREATE INDEX idx_post_reports_status ON public.post_reports(status, created_at DESC);

-- Profile columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS glucose_unit TEXT DEFAULT 'mg/dL';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_glucose_low NUMERIC DEFAULT 70;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_glucose_high NUMERIC DEFAULT 180;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS insulin_sensitivity_factor NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carb_ratio NUMERIC;

-- User preferences columns
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS quiet_hours_start TIME;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS alert_priority TEXT DEFAULT 'all';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS export_format TEXT DEFAULT 'csv';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notification_sound TEXT DEFAULT 'default';

-- RLS on all new tables
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_rotation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burnout_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users manage own meal_logs" ON public.meal_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own supply_logs" ON public.supply_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own exercise_logs" ON public.exercise_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mood_logs" ON public.mood_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own lab_results" ON public.lab_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own appointment_reminders" ON public.appointment_reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own medication_logs" ON public.medication_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own site_rotation_logs" ON public.site_rotation_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own search_history" ON public.search_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own saved_scenarios" ON public.saved_scenarios FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own burnout_scores" ON public.burnout_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own alert_history" ON public.alert_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own page_views" ON public.page_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read page_views" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users insert own post_reports" ON public.post_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Admins manage post_reports" ON public.post_reports FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Users insert volunteer_signups" ON public.volunteer_signups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own volunteer_signups" ON public.volunteer_signups FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage volunteer_signups" ON public.volunteer_signups FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Triggers
CREATE TRIGGER update_saved_scenarios_updated_at BEFORE UPDATE ON public.saved_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
