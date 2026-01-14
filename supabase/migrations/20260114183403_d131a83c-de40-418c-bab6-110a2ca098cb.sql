-- Add Semantic Scholar-specific columns to medical_research_papers
ALTER TABLE medical_research_papers
ADD COLUMN IF NOT EXISTS tldr_summary TEXT,
ADD COLUMN IF NOT EXISTS influential_citation_count INTEGER,
ADD COLUMN IF NOT EXISTS semantic_scholar_id TEXT,
ADD COLUMN IF NOT EXISTS fields_of_study TEXT[];

-- Add index for Semantic Scholar ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_medical_research_papers_semantic_scholar_id 
ON medical_research_papers(semantic_scholar_id) 
WHERE semantic_scholar_id IS NOT NULL;

-- Add index for influential citation count for sorting
CREATE INDEX IF NOT EXISTS idx_medical_research_papers_influential_citations 
ON medical_research_papers(influential_citation_count DESC NULLS LAST);