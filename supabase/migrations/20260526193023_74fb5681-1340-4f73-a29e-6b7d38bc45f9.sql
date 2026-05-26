
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_trgm_research_title    ON public.medical_research_papers   USING gin (title    gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_research_abstract ON public.medical_research_papers   USING gin (abstract gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_devices_name      ON public.devices                   USING gin (name     gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_medications_name  ON public.medications               USING gin (name     gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_companies_name    ON public.t1d_companies             USING gin (name     gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_trials_title      ON public.clinical_trials_detailed  USING gin (title    gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_articles_title    ON public.articles                  USING gin (title    gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_posts_title       ON public.community_posts           USING gin (title    gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_projects_title    ON public.diabetic_health_projects  USING gin (title    gin_trgm_ops);

WITH normalized AS (
  SELECT
    id,
    CASE
      WHEN doi IS NOT NULL AND length(trim(doi)) > 0
        THEN md5('doi:' || lower(regexp_replace(doi, '^https?://(dx\.)?doi\.org/', '', 'i')))
      WHEN pmid IS NOT NULL AND length(trim(pmid)) > 0
        THEN md5('pmid:' || trim(pmid))
      WHEN title IS NOT NULL AND length(trim(title)) >= 10
        THEN md5(
          'tay:' ||
          regexp_replace(lower(regexp_replace(title, '[^a-z0-9 ]+', ' ', 'gi')), '\s+', ' ', 'g') ||
          '|' ||
          coalesce(
            regexp_replace(
              lower(regexp_replace(split_part(coalesce(authors[1], ''), ',', 1), '[^a-z0-9 ]+', ' ', 'gi')),
              '\s+', ' ', 'g'
            ),
            ''
          ) ||
          '|' ||
          coalesce(to_char(publication_date, 'YYYY'), '')
        )
      ELSE NULL
    END AS new_hash
  FROM public.medical_research_papers
  WHERE content_hash IS NULL
)
UPDATE public.medical_research_papers p
SET content_hash = n.new_hash
FROM normalized n
WHERE p.id = n.id AND n.new_hash IS NOT NULL;

WITH ranked AS (
  SELECT
    id,
    content_hash,
    row_number() OVER (PARTITION BY content_hash ORDER BY updated_at DESC NULLS LAST, created_at DESC) AS rn
  FROM public.medical_research_papers
  WHERE content_hash IS NOT NULL
)
DELETE FROM public.medical_research_papers
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_research_content_hash
  ON public.medical_research_papers (content_hash)
  WHERE content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_archived_published
  ON public.community_posts (is_archived, published_at DESC);
