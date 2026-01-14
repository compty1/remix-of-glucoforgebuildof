-- Create user_dashboards table
CREATE TABLE public.user_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_dashboards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_dashboards table (users can only access their own dashboard)
CREATE POLICY "Users can view their own dashboard layout" 
ON public.user_dashboards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard layout" 
ON public.user_dashboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard layout" 
ON public.user_dashboards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard layout" 
ON public.user_dashboards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_dashboards_updated_at
BEFORE UPDATE ON public.user_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();