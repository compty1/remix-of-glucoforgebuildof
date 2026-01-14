-- Create discovery_cards table for storing research insights
CREATE TABLE public.discovery_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  snippet TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  credibility TEXT NOT NULL CHECK (credibility IN ('High', 'Medium', 'Low')),
  mechanism TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_insights table for user bookmarks
CREATE TABLE public.saved_insights (
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.discovery_cards(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

-- Create uploads table for tracking data uploads
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  filename TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  errors_json JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discovery_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for discovery_cards (public read, admin write)
CREATE POLICY "Discovery cards are viewable by everyone" 
ON public.discovery_cards FOR SELECT 
USING (true);

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for saved_insights
CREATE POLICY "Users can view their own saved insights" 
ON public.saved_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own insights" 
ON public.saved_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved insights" 
ON public.saved_insights FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for uploads
CREATE POLICY "Users can view their own uploads" 
ON public.uploads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads" 
ON public.uploads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_discovery_cards_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.snippet, '') || ' ' || 
    COALESCE(NEW.mechanism, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for search vector updates
CREATE TRIGGER update_discovery_cards_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.discovery_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discovery_cards_search_vector();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.discovery_cards (title, snippet, icon_url, credibility, mechanism, sources) VALUES 
('Post-Meal Walking Reduces Glucose Spikes', 'A 15-minute walk after meals can reduce post-prandial glucose peaks by up to 30% in T1D patients using CGM data analysis.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'High', 'Physical activity increases glucose uptake by skeletal muscles through GLUT4 translocation, independent of insulin action.', '[{"title": "Post-meal physical activity and glucose control", "url": "https://pubmed.ncbi.nlm.nih.gov/example1"}]'),
('Low-Carb Breakfast Protocol', 'Starting the day with <20g carbs and 25g protein stabilizes glucose for 4-6 hours based on community CGM patterns.', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', 'Medium', 'Reduced carbohydrate load minimizes insulin requirements while protein provides sustained satiety and gluconeogenesis.', '[{"title": "Protein and glucose stability", "url": "https://pubmed.ncbi.nlm.nih.gov/example2"}]'),
('Stress-Induced Glucose Variability', 'Psychological stress correlates with 15-25% higher glucose variability in T1D patients during work weeks vs. weekends.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', 'High', 'Cortisol release during stress increases hepatic glucose production and reduces insulin sensitivity.', '[{"title": "Stress and glucose control in diabetes", "url": "https://pubmed.ncbi.nlm.nih.gov/example3"}]'),
('Sleep Quality Impact on Dawn Phenomenon', 'Poor sleep quality (>2 awakenings) increases morning glucose rise by 40-60mg/dL compared to uninterrupted sleep.', 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400', 'Medium', 'Sleep fragmentation disrupts growth hormone and cortisol rhythms, affecting overnight glucose regulation.', '[{"title": "Sleep and dawn phenomenon", "url": "https://pubmed.ncbi.nlm.nih.gov/example4"}]'),
('Hydration and Glucose Trends', 'Maintaining >2L daily water intake correlates with 10% lower average glucose levels in T1D community data.', 'https://images.unsplash.com/photo-1506629905607-d9ddc4ec2d3f?w=400', 'Low', 'Proper hydration may improve insulin sensitivity and reduce glucose concentration through dilution effects.', '[{"title": "Hydration and metabolic control", "url": "https://pubmed.ncbi.nlm.nih.gov/example5"}]'),
('Temperature Sensor Accuracy Variation', 'CGM sensors show 15% higher MARD in ambient temperatures >85°F based on real-world accuracy studies.', 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400', 'High', 'Heat affects enzyme activity in glucose oxidase sensors and can cause calibration drift in continuous glucose monitors.', '[{"title": "Environmental factors in CGM accuracy", "url": "https://pubmed.ncbi.nlm.nih.gov/example6"}]');

-- Create index for search performance
CREATE INDEX idx_discovery_cards_search_vector ON public.discovery_cards USING GIN(search_vector);
CREATE INDEX idx_discovery_cards_credibility ON public.discovery_cards(credibility);
CREATE INDEX idx_discovery_cards_created_at ON public.discovery_cards(created_at DESC);