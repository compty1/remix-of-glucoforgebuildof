-- Add unique constraint on surveys title for upsert operations
ALTER TABLE public.surveys ADD CONSTRAINT surveys_title_unique UNIQUE (title);