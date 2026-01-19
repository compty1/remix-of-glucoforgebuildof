-- Create diabetic_health_projects table
CREATE TABLE public.diabetic_health_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  prevalence_percentage INTEGER,
  category TEXT NOT NULL,
  official_research_summary TEXT,
  community_insights_summary TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'under_review')),
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_research_links table
CREATE TABLE public.project_research_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.diabetic_health_projects(id) ON DELETE CASCADE,
  research_type TEXT NOT NULL DEFAULT 'study' CHECK (research_type IN ('study', 'paper', 'clinical_trial', 'meta_analysis')),
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  publication_date DATE,
  url TEXT,
  doi TEXT,
  key_findings TEXT,
  relevance_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_community_solutions table
CREATE TABLE public.project_community_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.diabetic_health_projects(id) ON DELETE CASCADE,
  solution_title TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  upvotes INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_submissions table
CREATE TABLE public.project_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  personal_experience TEXT,
  suggested_solutions TEXT,
  supporting_links TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.diabetic_health_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_research_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_community_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diabetic_health_projects (public read for published)
CREATE POLICY "Anyone can view published projects"
  ON public.diabetic_health_projects
  FOR SELECT
  USING (status = 'published');

-- RLS Policies for project_research_links (public read)
CREATE POLICY "Anyone can view research links"
  ON public.project_research_links
  FOR SELECT
  USING (true);

-- RLS Policies for project_community_solutions (public read)
CREATE POLICY "Anyone can view community solutions"
  ON public.project_community_solutions
  FOR SELECT
  USING (true);

-- RLS Policies for project_submissions
CREATE POLICY "Users can create submissions"
  ON public.project_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
  ON public.project_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_projects_slug ON public.diabetic_health_projects(slug);
CREATE INDEX idx_projects_category ON public.diabetic_health_projects(category);
CREATE INDEX idx_projects_status ON public.diabetic_health_projects(status);
CREATE INDEX idx_projects_featured ON public.diabetic_health_projects(featured) WHERE featured = true;
CREATE INDEX idx_research_links_project ON public.project_research_links(project_id);
CREATE INDEX idx_community_solutions_project ON public.project_community_solutions(project_id);
CREATE INDEX idx_submissions_user ON public.project_submissions(user_id);
CREATE INDEX idx_submissions_status ON public.project_submissions(status);

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.diabetic_health_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();