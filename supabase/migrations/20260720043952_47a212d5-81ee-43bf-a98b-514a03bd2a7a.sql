
CREATE OR REPLACE FUNCTION public.search_similar_content(
  q text,
  max_rows int DEFAULT 20,
  min_sim real DEFAULT 0.15
)
RETURNS TABLE (
  source text,
  id uuid,
  title text,
  snippet text,
  created_at timestamptz,
  similarity real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH q AS (SELECT COALESCE(NULLIF(trim(q), ''), '') AS term)
  SELECT * FROM (
    SELECT 'research_items'::text AS source, ri.id, ri.title,
           LEFT(COALESCE(ri.title,''), 240) AS snippet,
           ri.created_at,
           GREATEST(similarity(ri.title, (SELECT term FROM q)), 0)::real AS similarity
    FROM public.research_items ri, q
    WHERE q.term <> '' AND ri.title % q.term
    UNION ALL
    SELECT 'discoveries'::text, d.id, d.title,
           LEFT(COALESCE(d.summary,''), 240),
           COALESCE(d.publication_date, d.discovered_at),
           GREATEST(similarity(d.title, (SELECT term FROM q)),
                    similarity(COALESCE(d.summary,''), (SELECT term FROM q)))::real
    FROM public.discoveries d, q
    WHERE q.term <> '' AND (d.title % q.term OR d.summary % q.term)
    UNION ALL
    SELECT 'discovery_cards'::text, dc.id, dc.title,
           LEFT(COALESCE(dc.snippet,''), 240),
           dc.created_at,
           GREATEST(similarity(dc.title, (SELECT term FROM q)),
                    similarity(COALESCE(dc.snippet,''), (SELECT term FROM q)))::real
    FROM public.discovery_cards dc, q
    WHERE q.term <> '' AND (dc.title % q.term OR dc.snippet % q.term)
  ) results
  WHERE similarity >= min_sim
  ORDER BY similarity DESC, created_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(max_rows, 100));
$$;

REVOKE ALL ON FUNCTION public.search_similar_content(text, int, real) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_similar_content(text, int, real) TO anon, authenticated, service_role;
