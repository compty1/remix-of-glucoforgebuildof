-- Common T1D issues (pre-populated explore section)
CREATE TABLE t1d_common_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  icon text,
  search_keywords text[] DEFAULT '{}',
  solution_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User's saved issues with auto-summaries
CREATE TABLE user_saved_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  ai_summary text,
  solutions_found jsonb DEFAULT '[]',
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ongoing')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat sessions for conversation history
CREATE TABLE chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  saved_issue_id uuid REFERENCES user_saved_issues(id) ON DELETE SET NULL,
  messages jsonb DEFAULT '[]',
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE t1d_common_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- t1d_common_issues: Public read access
CREATE POLICY "Anyone can read common issues" 
  ON t1d_common_issues FOR SELECT USING (true);

-- user_saved_issues: Users can manage their own
CREATE POLICY "Users can read own saved issues" 
  ON user_saved_issues FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved issues" 
  ON user_saved_issues FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved issues" 
  ON user_saved_issues FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved issues" 
  ON user_saved_issues FOR DELETE USING (auth.uid() = user_id);

-- chat_sessions: Users can manage their own
CREATE POLICY "Users can read own chat sessions" 
  ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" 
  ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" 
  ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" 
  ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at on user_saved_issues
CREATE TRIGGER update_user_saved_issues_updated_at
  BEFORE UPDATE ON user_saved_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed common T1D issues for explore section
INSERT INTO t1d_common_issues (title, category, description, icon, search_keywords, solution_count) VALUES
-- Glucose Patterns
('Morning Lows', 'Glucose Patterns', 'Experiencing low blood sugar in the early morning hours, typically between 3-7am', 'Sunrise', ARRAY['morning', 'low', 'dawn', 'overnight', 'basal', 'hypoglycemia'], 47),
('Dawn Phenomenon', 'Glucose Patterns', 'Blood sugar rises in early morning due to hormone release, even without eating', 'TrendingUp', ARRAY['dawn', 'phenomenon', 'morning', 'high', 'hormones', 'cortisol'], 32),
('Post-Meal Spikes', 'Glucose Patterns', 'Blood sugar spikes higher than expected after meals despite proper bolusing', 'Utensils', ARRAY['spike', 'meal', 'food', 'bolus', 'carbs', 'postprandial'], 89),
('Exercise Crashes', 'Glucose Patterns', 'Sudden drops in blood sugar during or after physical activity', 'Activity', ARRAY['exercise', 'workout', 'low', 'crash', 'activity', 'gym', 'running'], 56),
('Overnight Highs', 'Glucose Patterns', 'Elevated blood sugar levels during sleep that persist until morning', 'Moon', ARRAY['overnight', 'high', 'sleep', 'night', 'basal', 'hyperglycemia'], 41),
('Rollercoaster Days', 'Glucose Patterns', 'Extreme swings between high and low blood sugar throughout the day', 'LineChart', ARRAY['swing', 'rollercoaster', 'unstable', 'variable', 'up', 'down'], 38),

-- Device Issues
('Sensor Accuracy', 'Device Issues', 'CGM readings that dont match fingerstick tests or seem unreliable', 'Target', ARRAY['sensor', 'accuracy', 'reading', 'cgm', 'calibration', 'dexcom', 'libre'], 63),
('Insertion Pain', 'Device Issues', 'Pain or discomfort when inserting CGM sensors or pump sites', 'Syringe', ARRAY['insertion', 'pain', 'hurt', 'site', 'needle', 'discomfort'], 29),
('Adhesion Problems', 'Device Issues', 'Sensors or pump sites falling off before their intended wear time', 'Bandage', ARRAY['adhesion', 'tape', 'falling', 'sticky', 'overlay', 'sweat'], 44),
('Compression Lows', 'Device Issues', 'False low readings when pressure is applied to CGM sensor (e.g., sleeping on it)', 'BedDouble', ARRAY['compression', 'low', 'false', 'sleep', 'pressure', 'arm'], 37),
('Pump Site Failures', 'Device Issues', 'Insulin not absorbing properly from pump infusion sites', 'AlertCircle', ARRAY['pump', 'site', 'failure', 'occlusion', 'absorption', 'insulin'], 31),

-- Lifestyle
('Travel Management', 'Lifestyle', 'Managing diabetes while traveling across time zones or in unfamiliar places', 'Plane', ARRAY['travel', 'timezone', 'flying', 'vacation', 'trip', 'airport'], 52),
('Eating Out', 'Lifestyle', 'Estimating carbs and managing blood sugar when eating at restaurants', 'UtensilsCrossed', ARRAY['restaurant', 'eating', 'carbs', 'estimate', 'dining', 'food'], 67),
('Alcohol Management', 'Lifestyle', 'Preventing lows while drinking and managing delayed effects of alcohol', 'Wine', ARRAY['alcohol', 'drinking', 'beer', 'wine', 'low', 'delayed'], 43),
('Sleep Quality', 'Lifestyle', 'CGM alarms and blood sugar fluctuations affecting sleep', 'Moon', ARRAY['sleep', 'alarm', 'tired', 'rest', 'night', 'fatigue'], 35),
('Stress Impact', 'Lifestyle', 'Understanding how stress affects blood sugar levels', 'Brain', ARRAY['stress', 'anxiety', 'cortisol', 'high', 'emotional', 'mental'], 28),

-- Emotional
('Diabetes Burnout', 'Emotional', 'Feeling overwhelmed, exhausted, or apathetic about diabetes management', 'Battery', ARRAY['burnout', 'tired', 'exhausted', 'overwhelmed', 'motivation'], 61),
('Low Anxiety', 'Emotional', 'Fear of hypoglycemia leading to running blood sugar too high', 'AlertTriangle', ARRAY['anxiety', 'fear', 'low', 'scared', 'worry', 'panic'], 39),
('Social Situations', 'Emotional', 'Feeling self-conscious about diabetes management in public', 'Users', ARRAY['social', 'public', 'embarrassed', 'awkward', 'friends'], 33),
('Healthcare Frustration', 'Emotional', 'Difficulties with insurance, doctors, or accessing supplies', 'Building2', ARRAY['insurance', 'doctor', 'endo', 'supplies', 'cost', 'coverage'], 45),

-- Technical
('Basal Adjustments', 'Technical', 'Fine-tuning background insulin rates for better control', 'Settings', ARRAY['basal', 'rate', 'adjustment', 'setting', 'background', 'insulin'], 54),
('Carb Counting', 'Technical', 'Accurately counting carbohydrates for proper bolusing', 'Calculator', ARRAY['carb', 'count', 'estimate', 'ratio', 'food', 'bolus'], 72),
('Pre-bolusing', 'Technical', 'Timing insulin before meals to prevent spikes', 'Timer', ARRAY['prebolus', 'timing', 'before', 'meal', 'spike', 'advance'], 48),
('Loop Settings', 'Technical', 'Optimizing automated insulin delivery system settings', 'RefreshCw', ARRAY['loop', 'automated', 'control-iq', 'omnipod', 'settings', 'algorithm'], 36);
