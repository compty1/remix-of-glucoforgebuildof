-- Create cure_therapies table for tracking T1D cure research
CREATE TABLE public.cure_therapies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL CHECK (phase IN ('Preclinical', 'Phase I', 'Phase I/II', 'Phase II', 'Phase II/III', 'Phase III', 'FDA Review', 'Approved')),
  category TEXT NOT NULL,
  sponsor TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  estimated_completion DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed', 'Discontinued')),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cure_milestones table for tracking therapy milestones
CREATE TABLE public.cure_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapy_id UUID NOT NULL REFERENCES public.cure_therapies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delayed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cure_therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cure_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (cure research should be public)
CREATE POLICY "Cure therapies are viewable by everyone" 
ON public.cure_therapies 
FOR SELECT 
USING (true);

CREATE POLICY "Cure milestones are viewable by everyone" 
ON public.cure_milestones 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_cure_therapies_phase ON public.cure_therapies(phase);
CREATE INDEX idx_cure_therapies_category ON public.cure_therapies(category);
CREATE INDEX idx_cure_therapies_status ON public.cure_therapies(status);
CREATE INDEX idx_cure_milestones_therapy_id ON public.cure_milestones(therapy_id);
CREATE INDEX idx_cure_milestones_status ON public.cure_milestones(status);

-- Create trigger for updating timestamps
CREATE TRIGGER update_cure_therapies_updated_at
BEFORE UPDATE ON public.cure_therapies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cure_milestones_updated_at
BEFORE UPDATE ON public.cure_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.cure_therapies (name, description, phase, category, sponsor, progress_percentage, confidence_score, estimated_completion, website_url) VALUES
('Teplizumab (Tzield)', 'Anti-CD3 monoclonal antibody for delaying T1D onset in at-risk individuals', 'Approved', 'Immunotherapy', 'Provention Bio', 100, 95, '2022-11-17', 'https://www.provbio.com/'),
('ATG-GCSF Cell Therapy', 'Autologous regulatory T-cell therapy to preserve beta cell function', 'Phase II', 'Cell Therapy', 'UCSF', 65, 78, '2025-03-15', 'https://clinicaltrials.gov/ct2/show/NCT02691247'),
('Stem Cell-Derived Beta Cells', 'Encapsulated pancreatic islet cells from stem cells', 'Phase I/II', 'Cell Replacement', 'Vertex Pharmaceuticals', 45, 82, '2026-06-30', 'https://www.vrtx.com/'),
('Smart Insulin Patches', 'Glucose-responsive insulin delivery system', 'Preclinical', 'Smart Delivery', 'University of North Carolina', 25, 70, '2027-12-01', 'https://www.unc.edu/'),
('Artificial Pancreas 2.0', 'Next-generation automated insulin delivery with glucagon', 'Phase III', 'Technology', 'Beta Bionics', 80, 88, '2024-09-15', 'https://www.betabionics.com/'),
('Gene Therapy GT-002', 'Gene editing approach to restore insulin production', 'Phase I', 'Gene Therapy', 'CRISPR Therapeutics', 30, 75, '2028-01-20', 'https://crisprtx.com/');