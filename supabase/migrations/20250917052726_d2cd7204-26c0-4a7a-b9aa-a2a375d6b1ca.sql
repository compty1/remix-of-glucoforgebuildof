-- For the "Glycemic Shift" Journal
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    shift_time TIMESTAMPTZ NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('High','Low')),
    context TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on shifts table
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts
CREATE POLICY "Users can view their own shifts" 
ON public.shifts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shifts" 
ON public.shifts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts" 
ON public.shifts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shifts" 
ON public.shifts 
FOR DELETE 
USING (auth.uid() = user_id);

-- For the "Scenario Lab"
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_name TEXT NOT NULL,
    params JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on simulations table
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Create policies for simulations
CREATE POLICY "Users can view their own simulations" 
ON public.simulations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own simulations" 
ON public.simulations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- For "Device Issue Tracking"
CREATE TABLE IF NOT EXISTS public.device_issues_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    root_cause_analysis TEXT,
    manufacturer_response_status TEXT,
    is_critical_safety_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on device_issues_master table
ALTER TABLE public.device_issues_master ENABLE ROW LEVEL SECURITY;

-- Create policy for device_issues_master (public read)
CREATE POLICY "Device issues master are viewable by everyone" 
ON public.device_issues_master 
FOR SELECT 
USING (true);

-- For "Trend Analysis"
CREATE TABLE IF NOT EXISTS public.trend_analysis_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    issue_title TEXT NOT NULL UNIQUE,
    seven_day_count INTEGER DEFAULT 0,
    thirty_day_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on trend_analysis_metrics table
ALTER TABLE public.trend_analysis_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for trend_analysis_metrics (public read)
CREATE POLICY "Trend analysis metrics are viewable by everyone" 
ON public.trend_analysis_metrics 
FOR SELECT 
USING (true);

-- For the "First 100 Days" Onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_tips (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL UNIQUE,
    tip_title TEXT NOT NULL,
    tip_content TEXT NOT NULL
);

-- Enable RLS on onboarding_tips table
ALTER TABLE public.onboarding_tips ENABLE ROW LEVEL SECURITY;

-- Create policy for onboarding_tips (public read)
CREATE POLICY "Onboarding tips are viewable by everyone" 
ON public.onboarding_tips 
FOR SELECT 
USING (true);

-- For the "Financial Tools Hub"
CREATE TABLE IF NOT EXISTS public.financial_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Enable RLS on financial_resources table
ALTER TABLE public.financial_resources ENABLE ROW LEVEL SECURITY;

-- Create policy for financial_resources (public read)
CREATE POLICY "Financial resources are viewable by everyone" 
ON public.financial_resources 
FOR SELECT 
USING (true);

-- For bounties functionality
CREATE TABLE IF NOT EXISTS public.bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed')),
    claimed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on bounties table
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

-- Create policies for bounties
CREATE POLICY "Bounties are viewable by everyone" 
ON public.bounties 
FOR SELECT 
USING (true);

CREATE POLICY "Users can claim bounties" 
ON public.bounties 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Add trigger for automatic timestamp updates on multiple tables
CREATE TRIGGER update_bounties_updated_at
BEFORE UPDATE ON public.bounties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trend_analysis_metrics_updated_at
BEFORE UPDATE ON public.trend_analysis_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create database function for trend analysis updates
CREATE OR REPLACE FUNCTION public.update_trends()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    keyword_record RECORD;
    seven_day_count INTEGER;
    thirty_day_count INTEGER;
BEGIN
    -- Define keywords to track
    FOR keyword_record IN 
        SELECT unnest(ARRAY['sensor', 'cgm', 'dexcom', 'libre', 'omnipod', 'insulin', 'high glucose', 'low glucose']) AS keyword
    LOOP
        -- Count 7-day mentions
        SELECT COUNT(*) INTO seven_day_count
        FROM community_posts 
        WHERE content ILIKE '%' || keyword_record.keyword || '%'
        AND fetched_at >= NOW() - INTERVAL '7 days';
        
        -- Count 30-day mentions
        SELECT COUNT(*) INTO thirty_day_count
        FROM community_posts 
        WHERE content ILIKE '%' || keyword_record.keyword || '%'
        AND fetched_at >= NOW() - INTERVAL '30 days';
        
        -- Insert or update the metrics
        INSERT INTO trend_analysis_metrics (category, issue_title, seven_day_count, thirty_day_count)
        VALUES ('community', keyword_record.keyword, seven_day_count, thirty_day_count)
        ON CONFLICT (issue_title) 
        DO UPDATE SET 
            seven_day_count = EXCLUDED.seven_day_count,
            thirty_day_count = EXCLUDED.thirty_day_count,
            updated_at = NOW();
    END LOOP;
END;
$$;

-- Insert some sample data for immediate functionality
INSERT INTO public.onboarding_tips (day_number, tip_title, tip_content) VALUES
(1, 'Welcome to Your Diabetes Journey', 'Today marks the beginning of your empowered diabetes management. Focus on learning one new thing about your condition.'),
(2, 'Understanding Blood Sugar Patterns', 'Start tracking your glucose readings at the same times each day to identify patterns.'),
(3, 'Building Your Support Network', 'Connect with other people with diabetes in our community section for shared experiences and tips.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO public.financial_resources (resource_title, description, link, category) VALUES
('Insurance Appeal Template', 'Copy-paste template for appealing CGM coverage denials', '#', 'Insurance'),
('Pharmacy Assistance Programs', 'List of manufacturer programs for insulin and supplies', '#', 'Prescriptions'),
('Tax Deduction Guide', 'Complete guide to diabetes-related tax deductions', '#', 'Tax Benefits')
ON CONFLICT DO NOTHING;

INSERT INTO public.bounties (title, description, reward_amount) VALUES
('CGM Sensor Comparison Study', 'Help us compare accuracy between different CGM brands by sharing your data', 50),
('Insulin Pump Settings Optimization', 'Share your successful pump settings for specific situations', 25),
('Exercise Impact Analysis', 'Document how different types of exercise affect your glucose levels', 30)
ON CONFLICT DO NOTHING;