
CREATE OR REPLACE FUNCTION public.get_high_performer_benchmarks()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  overall_stats JSON;
  time_block_stats JSON;
  pump_stats JSON;
  cgm_stats JSON;
  age_stats JSON;
  population_distribution JSON;
BEGIN
  -- Overall stats for high performers (TIR >= 70%)
  SELECT json_build_object(
    'count', COUNT(DISTINCT anonymized_user_id),
    'avg_glucose', ROUND(AVG(glucose_value)::numeric, 1),
    'tir', ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'time_below_70', ROUND((COUNT(*) FILTER (WHERE glucose_value < 70)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'time_below_54', ROUND((COUNT(*) FILTER (WHERE glucose_value < 54)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'time_above_180', ROUND((COUNT(*) FILTER (WHERE glucose_value > 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'time_above_250', ROUND((COUNT(*) FILTER (WHERE glucose_value > 250)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'cv', ROUND((STDDEV(glucose_value) / NULLIF(AVG(glucose_value), 0) * 100)::numeric, 1),
    'gmi', ROUND((3.31 + 0.02392 * AVG(glucose_value))::numeric, 1),
    'std_dev', ROUND(STDDEV(glucose_value)::numeric, 1)
  )
  INTO overall_stats
  FROM public_glucose_data
  WHERE glucose_value IS NOT NULL
    AND control_level IN ('excellent', 'good');

  -- Time-of-day breakdown for high performers
  SELECT json_agg(block ORDER BY block_order)
  INTO time_block_stats
  FROM (
    SELECT
      CASE
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 0 AND 5 THEN 'Night'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11 THEN 'Morning'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 17 THEN 'Afternoon'
        ELSE 'Evening'
      END as name,
      CASE
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 0 AND 5 THEN 1
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11 THEN 2
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 17 THEN 3
        ELSE 4
      END as block_order,
      ROUND(AVG(glucose_value)::numeric, 1) as avg,
      ROUND((STDDEV(glucose_value) / NULLIF(AVG(glucose_value), 0) * 100)::numeric, 1) as cv,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND control_level IN ('excellent', 'good')
    GROUP BY 1, 2
  ) block;

  -- Top pump models among high performers
  SELECT json_agg(p ORDER BY count DESC)
  INTO pump_stats
  FROM (
    SELECT pump_model as name, COUNT(*) as count,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND control_level IN ('excellent', 'good') AND pump_model IS NOT NULL
    GROUP BY pump_model
    ORDER BY count DESC
    LIMIT 5
  ) p;

  -- Top CGM models among high performers
  SELECT json_agg(c ORDER BY count DESC)
  INTO cgm_stats
  FROM (
    SELECT cgm_model as name, COUNT(*) as count,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND control_level IN ('excellent', 'good') AND cgm_model IS NOT NULL
    GROUP BY cgm_model
    ORDER BY count DESC
    LIMIT 5
  ) c;

  -- Age range breakdown for high performers
  SELECT json_agg(a)
  INTO age_stats
  FROM (
    SELECT age_range as name, COUNT(DISTINCT anonymized_user_id) as users,
      ROUND(AVG(glucose_value)::numeric, 1) as avg_glucose,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND control_level IN ('excellent', 'good') AND age_range IS NOT NULL
    GROUP BY age_range
  ) a;

  -- Population TIR distribution (all users, for percentile calc)
  SELECT json_agg(d ORDER BY tir_bucket)
  INTO population_distribution
  FROM (
    SELECT
      CASE
        WHEN user_tir < 30 THEN 'Below 30%'
        WHEN user_tir < 50 THEN '30-50%'
        WHEN user_tir < 60 THEN '50-60%'
        WHEN user_tir < 70 THEN '60-70%'
        WHEN user_tir < 80 THEN '70-80%'
        WHEN user_tir < 90 THEN '80-90%'
        ELSE '90-100%'
      END as tir_bucket,
      CASE
        WHEN user_tir < 30 THEN 1
        WHEN user_tir < 50 THEN 2
        WHEN user_tir < 60 THEN 3
        WHEN user_tir < 70 THEN 4
        WHEN user_tir < 80 THEN 5
        WHEN user_tir < 90 THEN 6
        ELSE 7
      END as bucket_order,
      COUNT(*) as user_count
    FROM (
      SELECT anonymized_user_id,
        ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as user_tir
      FROM public_glucose_data
      WHERE glucose_value IS NOT NULL
      GROUP BY anonymized_user_id
    ) user_tirs
    GROUP BY 1, 2
  ) d;

  SELECT json_build_object(
    'highPerformers', overall_stats,
    'timeOfDay', COALESCE(time_block_stats, '[]'::json),
    'topPumps', COALESCE(pump_stats, '[]'::json),
    'topCGMs', COALESCE(cgm_stats, '[]'::json),
    'ageBreakdown', COALESCE(age_stats, '[]'::json),
    'populationDistribution', COALESCE(population_distribution, '[]'::json)
  ) INTO result;

  RETURN result;
END;
$function$;
