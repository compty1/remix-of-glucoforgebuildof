-- Create research_items table
CREATE TABLE public.research_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  summary TEXT,
  source TEXT NOT NULL,
  impact_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Research items are viewable by everyone" 
ON public.research_items 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_research_items_updated_at
BEFORE UPDATE ON public.research_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();