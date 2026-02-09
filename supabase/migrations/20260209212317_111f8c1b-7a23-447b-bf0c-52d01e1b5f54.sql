
-- View: validation error summary (validation_errors is jsonb array)
CREATE OR REPLACE VIEW public.vw_quarantine_error_summary AS
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

-- View: quarantine priority (validation_errors is jsonb)
CREATE OR REPLACE VIEW public.vw_quarantine_priority AS
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
