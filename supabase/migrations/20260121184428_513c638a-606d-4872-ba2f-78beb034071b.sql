-- =============================================
-- PHASE 1-24 DATABASE MIGRATIONS
-- Foundation tables for all new features
-- =============================================

-- 1. Donations tracking table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending',
  donor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. User activity log for tracking platform actions
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Update profiles table with new fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auto_nickname TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_style TEXT DEFAULT 'default';

-- 4. Low Blood Sugar Stories
CREATE TABLE IF NOT EXISTS public.low_blood_sugar_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  illustration_url TEXT,
  source_url TEXT,
  source_platform TEXT,
  author_username TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('funny', 'scary', 'educational', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 5. Adult Content Posts (18+)
CREATE TABLE IF NOT EXISTS public.adult_content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('drug_effects', 'intimacy', 'alcohol', 'other')),
  source_url TEXT,
  source_platform TEXT,
  author_username TEXT,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  tips TEXT[],
  warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Adult Content User Submissions
CREATE TABLE IF NOT EXISTS public.adult_content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('drug_effects', 'intimacy', 'alcohol', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Articles/Blog System
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  reading_time_mins INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Healthcare Experiences
CREATE TABLE IF NOT EXISTS public.healthcare_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  category TEXT CHECK (category IN ('insurance', 'doctors', 'hospitals', 'pharmacy', 'emergency', 'other')),
  source_url TEXT,
  source_platform TEXT,
  location_state TEXT,
  is_published BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. AI Healthcare Recommendations
CREATE TABLE IF NOT EXISTS public.ai_healthcare_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  analysis_summary TEXT,
  based_on_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Community Statements (Homepage Jar)
CREATE TABLE IF NOT EXISTS public.community_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  statement TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Healthcare Partner Inquiries
CREATE TABLE IF NOT EXISTS public.healthcare_partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization_type TEXT,
  interest_areas TEXT[],
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Diabetes Apps
CREATE TABLE IF NOT EXISTS public.diabetes_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT,
  platforms TEXT[],
  download_urls JSONB,
  features TEXT[],
  pros TEXT[],
  cons TEXT[],
  avg_rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  last_update TEXT,
  developer TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. App Reviews
CREATE TABLE IF NOT EXISTS public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES public.diabetes_apps(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  source_url TEXT,
  source_platform TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Trending Device Issues
CREATE TABLE IF NOT EXISTS public.trending_device_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  affected_users_estimate INTEGER,
  first_reported TIMESTAMP WITH TIME ZONE,
  last_reported TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. Device Improvements
CREATE TABLE IF NOT EXISTS public.device_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  improvement_title TEXT NOT NULL,
  description TEXT,
  release_date DATE,
  version TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Add medication logos
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS manufacturer_logo_url TEXT;

-- 17. Diabetes Emergence Data
CREATE TABLE IF NOT EXISTS public.diabetes_emergence_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  diagnoses_count INTEGER,
  region TEXT,
  age_group TEXT,
  source TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 18. Diabetes Myths
CREATE TABLE IF NOT EXISTS public.diabetes_myths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  myth TEXT NOT NULL,
  official_verdict TEXT CHECK (official_verdict IN ('true', 'false', 'partially_true', 'unproven')),
  official_explanation TEXT,
  official_sources TEXT[],
  autonomous_verdict TEXT CHECK (autonomous_verdict IN ('true', 'false', 'partially_true', 'unproven', 'requires_investigation')),
  autonomous_explanation TEXT,
  autonomous_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 19. Education Topics
CREATE TABLE IF NOT EXISTS public.education_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  content JSONB,
  illustrations JSONB,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  related_topics TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 20. Warrior Stories
CREATE TABLE IF NOT EXISTS public.warrior_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  person_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  social_handle TEXT,
  platform TEXT,
  contact_info TEXT,
  obstacles TEXT[],
  triumphs TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 21. Potential Warriors (AI-found)
CREATE TABLE IF NOT EXISTS public.potential_warriors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  username TEXT,
  post_content TEXT,
  post_url TEXT,
  detected_keywords TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 22. Shop Products
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  category TEXT CHECK (category IN ('id_bracelet', 'id_necklace', 'id_card', 'supplement', 'accessory', 'case', 'other')),
  images TEXT[],
  stripe_price_id TEXT,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  customization_options JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 23. Shop Orders
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  products JSONB NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 24. Public Glucose Data
CREATE TABLE IF NOT EXISTS public.public_glucose_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_dataset TEXT NOT NULL,
  anonymized_user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  glucose_value DECIMAL(5,1),
  insulin_dose DECIMAL(4,2),
  carbs INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 25. Population Insights
CREATE TABLE IF NOT EXISTS public.population_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  description TEXT,
  data JSONB,
  affected_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 26. T1D Products (external products)
CREATE TABLE IF NOT EXISTS public.t1d_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  purchase_url TEXT,
  avg_rating DECIMAL(2,1),
  price_range TEXT,
  features TEXT[],
  pros TEXT[],
  cons TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 27. Product Reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.t1d_products(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  source_url TEXT,
  source_platform TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_blood_sugar_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adult_content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adult_content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_healthcare_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_partner_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diabetes_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_device_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diabetes_emergence_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diabetes_myths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warrior_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potential_warriors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_glucose_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t1d_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Donations: Users can view their own, admins can view all
CREATE POLICY "Users can view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert donations" ON public.donations FOR INSERT WITH CHECK (true);

-- User Activity Log: Users see their own
CREATE POLICY "Users can view own activity" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read tables (published content)
CREATE POLICY "Anyone can view published stories" ON public.low_blood_sugar_stories FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published adult content" ON public.adult_content_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published healthcare experiences" ON public.healthcare_experiences FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view AI recommendations" ON public.ai_healthcare_recommendations FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved statements" ON public.community_statements FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can view diabetes apps" ON public.diabetes_apps FOR SELECT USING (true);
CREATE POLICY "Anyone can view app reviews" ON public.app_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can view trending issues" ON public.trending_device_issues FOR SELECT USING (true);
CREATE POLICY "Anyone can view device improvements" ON public.device_improvements FOR SELECT USING (true);
CREATE POLICY "Anyone can view emergence data" ON public.diabetes_emergence_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view myths" ON public.diabetes_myths FOR SELECT USING (true);
CREATE POLICY "Anyone can view published education" ON public.education_topics FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published warrior stories" ON public.warrior_stories FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view active products" ON public.shop_products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view public glucose data" ON public.public_glucose_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view population insights" ON public.population_insights FOR SELECT USING (true);
CREATE POLICY "Anyone can view t1d products" ON public.t1d_products FOR SELECT USING (true);
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews FOR SELECT USING (true);

-- User submissions
CREATE POLICY "Users can insert statements" ON public.community_statements FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert adult submissions" ON public.adult_content_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own adult submissions" ON public.adult_content_submissions FOR SELECT USING (auth.uid() = user_id);

-- Healthcare inquiries
CREATE POLICY "Anyone can submit inquiries" ON public.healthcare_partner_inquiries FOR INSERT WITH CHECK (true);

-- Shop orders: Users see their own
CREATE POLICY "Users can view own orders" ON public.shop_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert orders" ON public.shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Potential warriors: Admin only (no public policy)
-- Articles author policy
CREATE POLICY "Authors can manage own articles" ON public.articles FOR ALL USING (auth.uid() = author_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_education_slug ON public.education_topics(slug);
CREATE INDEX IF NOT EXISTS idx_public_glucose_timestamp ON public.public_glucose_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_shop_orders_user ON public.shop_orders(user_id);