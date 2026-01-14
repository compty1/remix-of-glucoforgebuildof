-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for surveys table (public read access)
CREATE POLICY "Surveys are viewable by everyone" 
ON public.surveys 
FOR SELECT 
USING (true);

-- Create policies for survey_responses table (users can only manage their own responses)
CREATE POLICY "Users can view their own survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey responses" 
ON public.survey_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own survey responses" 
ON public.survey_responses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();