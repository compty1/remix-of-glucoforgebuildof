
-- Recreate all views with security_invoker = true

-- Drop existing views first
DROP VIEW IF EXISTS public.vw_quarantine_error_summary;
DROP VIEW IF EXISTS public.vw_quarantine_priority;

-- View: recent quarantined items
CREATE VIEW public.vw_quarantine_recent 
WITH (security_invoker = true) AS
SELECT
  q.id AS quarantine_id,
  q.post_id,
  q.raw_payload,
  q.received_at,
  q.reviewed,
  q.reviewer,
  q.review_notes,
  (q.raw_payload->>'title')::text AS title,
  LEFT((q.raw_payload->>'body')::text, 400) AS body_snippet,
  (q.raw_payload->>'source')::text AS source,
  (q.raw_payload->>'url')::text AS source_url,
  q.validation_errors
FROM public.post_quarantine q
ORDER BY q.received_at DESC;

-- View: validation error summary
CREATE VIEW public.vw_quarantine_error_summary
WITH (security_invoker = true) AS
SELECT
  err_text,
  COUNT(*) AS occurrences
FROM (
  SELECT jsonb_array_elements_text(validation_errors) AS err_text
  FROM public.post_quarantine
  WHERE validation_errors IS NOT NULL AND jsonb_typeof(validation_errors) = 'array'
) t
GROUP BY err_text
ORDER BY occurrences DESC;

-- View: link health across posts
CREATE VIEW public.vw_posts_link_health
WITH (security_invoker = true) AS
SELECT
  p.id AS post_id,
  p.title,
  p.url,
  p.canonical_url,
  (p.link_status->>'status')::text AS link_status_val,
  (p.link_status->>'http_code')::int AS http_code,
  (p.link_status->>'last_checked')::timestamp AS last_checked,
  p.confidence_score
FROM public.community_posts p
WHERE p.post_type = 'post'
ORDER BY last_checked DESC NULLS LAST;

-- View: quarantine priority
CREATE VIEW public.vw_quarantine_priority
WITH (security_invoker = true) AS
SELECT
  q.id AS quarantine_id,
  (q.raw_payload->>'title')::text AS title,
  q.received_at,
  q.validation_errors,
  q.reviewed,
  jsonb_array_length(COALESCE(q.validation_errors, '[]'::jsonb)) AS error_count,
  CASE
    WHEN q.received_at > now() - interval '1 day' THEN 3
    WHEN q.received_at > now() - interval '7 days' THEN 2
    ELSE 1
  END AS recency_score,
  (jsonb_array_length(COALESCE(q.validation_errors, '[]'::jsonb)) * 2 +
   CASE
     WHEN q.received_at > now() - interval '1 day' THEN 3
     WHEN q.received_at > now() - interval '7 days' THEN 2
     ELSE 1
   END) AS priority_score
FROM public.post_quarantine q
WHERE q.reviewed = false
ORDER BY priority_score DESC, q.received_at DESC;
