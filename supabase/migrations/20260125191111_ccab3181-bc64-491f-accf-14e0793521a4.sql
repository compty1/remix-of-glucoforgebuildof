-- Add Type 1 Diabetes classification columns to medical_research_papers
ALTER TABLE medical_research_papers
ADD COLUMN IF NOT EXISTS is_type1_relevant boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS diabetes_type text,
ADD COLUMN IF NOT EXISTS classification_confidence numeric;

-- Add constraint for diabetes_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medical_research_papers_diabetes_type_check'
  ) THEN
    ALTER TABLE medical_research_papers 
    ADD CONSTRAINT medical_research_papers_diabetes_type_check 
    CHECK (diabetes_type IN ('type1', 'type2', 'general', 'gestational') OR diabetes_type IS NULL);
  END IF;
END $$;

-- Add constraint for classification_confidence range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medical_research_papers_classification_confidence_check'
  ) THEN
    ALTER TABLE medical_research_papers 
    ADD CONSTRAINT medical_research_papers_classification_confidence_check 
    CHECK (classification_confidence >= 0 AND classification_confidence <= 1 OR classification_confidence IS NULL);
  END IF;
END $$;

-- Create partial index for efficient T1D filtering
CREATE INDEX IF NOT EXISTS idx_medical_research_t1d 
ON medical_research_papers(is_type1_relevant)
WHERE is_type1_relevant = true;

-- Add comment
COMMENT ON COLUMN medical_research_papers.is_type1_relevant IS 'AI-classified Type 1 Diabetes relevance';

-- Update existing papers to mark T1D-relevant ones based on title/abstract keywords
UPDATE medical_research_papers
SET 
  is_type1_relevant = true,
  diabetes_type = 'type1',
  classification_confidence = 0.85
WHERE 
  (title ILIKE '%type 1 diabetes%' OR title ILIKE '%T1D%' OR title ILIKE '%type 1 diabetic%' OR 
   title ILIKE '%insulin-dependent%' OR title ILIKE '%autoimmune diabetes%' OR
   title ILIKE '%juvenile diabetes%' OR title ILIKE '%IDDM%' OR
   abstract ILIKE '%type 1 diabetes%' OR abstract ILIKE '% T1D %' OR 
   abstract ILIKE '%insulin-dependent diabetes%' OR abstract ILIKE '%autoimmune diabetes%')
  AND NOT (title ILIKE '%type 2%' AND title NOT ILIKE '%type 1%')
  AND is_type1_relevant IS NOT TRUE;

-- Mark general diabetes papers
UPDATE medical_research_papers
SET 
  diabetes_type = 'general',
  classification_confidence = 0.7
WHERE 
  diabetes_type IS NULL
  AND (title ILIKE '%diabetes%' OR abstract ILIKE '%diabetes%')
  AND is_type1_relevant IS NOT TRUE;