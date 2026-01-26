-- Function to get all unique filter options for public glucose data
CREATE OR REPLACE FUNCTION public.get_glucose_filter_options()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'datasets', (SELECT json_agg(DISTINCT source_dataset) FROM public_glucose_data WHERE source_dataset IS NOT NULL),
    'age_ranges', (SELECT json_agg(DISTINCT age_range) FROM public_glucose_data WHERE age_range IS NOT NULL),
    'pumps', (SELECT json_agg(DISTINCT pump_model) FROM public_glucose_data WHERE pump_model IS NOT NULL),
    'cgms', (SELECT json_agg(DISTINCT cgm_model) FROM public_glucose_data WHERE cgm_model IS NOT NULL),
    'regions', (SELECT json_agg(DISTINCT location_region) FROM public_glucose_data WHERE location_region IS NOT NULL)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get aggregated glucose summary data
CREATE OR REPLACE FUNCTION public.get_public_glucose_summary(
  p_dataset TEXT DEFAULT NULL,
  p_age_range TEXT DEFAULT NULL,
  p_pump TEXT DEFAULT NULL,
  p_cgm TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_count BIGINT;
  unique_users BIGINT;
  hourly_data JSON;
  range_data JSON;
  age_breakdown JSON;
  region_breakdown JSON;
  pump_breakdown JSON;
  cgm_breakdown JSON;
  variability_data JSON;
  time_block_data JSON;
  insulin_data JSON;
  basal_data JSON;
  meal_data JSON;
  carb_data JSON;
BEGIN
  -- Get total count and unique users
  SELECT COUNT(*), COUNT(DISTINCT anonymized_user_id)
  INTO total_count, unique_users
  FROM public_glucose_data
  WHERE glucose_value IS NOT NULL
    AND (p_dataset IS NULL OR source_dataset = p_dataset)
    AND (p_age_range IS NULL OR age_range = p_age_range)
    AND (p_pump IS NULL OR pump_model = p_pump)
    AND (p_cgm IS NULL OR cgm_model = p_cgm)
    AND (p_region IS NULL OR location_region = p_region);

  -- Get hourly averages
  SELECT json_agg(hourly ORDER BY hour)
  INTO hourly_data
  FROM (
    SELECT 
      EXTRACT(HOUR FROM timestamp)::int as hour,
      ROUND(AVG(glucose_value)::numeric, 1) as average,
      MIN(glucose_value) as min,
      MAX(glucose_value) as max,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY EXTRACT(HOUR FROM timestamp)
  ) hourly;

  -- Get range distribution
  SELECT json_build_object(
    'veryLow', ROUND((COUNT(*) FILTER (WHERE glucose_value < 54)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'low', ROUND((COUNT(*) FILTER (WHERE glucose_value >= 54 AND glucose_value < 70)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'inRange', ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'high', ROUND((COUNT(*) FILTER (WHERE glucose_value > 180 AND glucose_value <= 250)::numeric / NULLIF(COUNT(*), 0) * 100), 1),
    'veryHigh', ROUND((COUNT(*) FILTER (WHERE glucose_value > 250)::numeric / NULLIF(COUNT(*), 0) * 100), 1)
  )
  INTO range_data
  FROM public_glucose_data
  WHERE glucose_value IS NOT NULL
    AND (p_dataset IS NULL OR source_dataset = p_dataset)
    AND (p_age_range IS NULL OR age_range = p_age_range)
    AND (p_pump IS NULL OR pump_model = p_pump)
    AND (p_cgm IS NULL OR cgm_model = p_cgm)
    AND (p_region IS NULL OR location_region = p_region);

  -- Get age breakdown with TIR
  SELECT json_agg(age_stats)
  INTO age_breakdown
  FROM (
    SELECT 
      age_range as age,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND age_range IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY age_range
    ORDER BY 
      CASE age_range 
        WHEN '0-18' THEN 1 
        WHEN '18-30' THEN 2 
        WHEN '31-45' THEN 3 
        WHEN '46-60' THEN 4 
        WHEN '60+' THEN 5 
      END
  ) age_stats;

  -- Get region breakdown
  SELECT json_agg(region_stats)
  INTO region_breakdown
  FROM (
    SELECT 
      location_region as region,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND location_region IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY location_region
    ORDER BY count DESC
  ) region_stats;

  -- Get pump breakdown with TIR
  SELECT json_agg(pump_stats)
  INTO pump_breakdown
  FROM (
    SELECT 
      pump_model as pump,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND pump_model IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY pump_model
    ORDER BY tir DESC
  ) pump_stats;

  -- Get CGM breakdown
  SELECT json_agg(cgm_stats)
  INTO cgm_breakdown
  FROM (
    SELECT 
      cgm_model as cgm,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND cgm_model IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY cgm_model
    ORDER BY count DESC
  ) cgm_stats;

  -- Get variability metrics
  SELECT json_build_object(
    'mean', ROUND(AVG(glucose_value)::numeric, 1),
    'stdDev', ROUND(STDDEV(glucose_value)::numeric, 1),
    'cv', ROUND((STDDEV(glucose_value) / NULLIF(AVG(glucose_value), 0) * 100)::numeric, 1),
    'gmi', ROUND((3.31 + 0.02392 * AVG(glucose_value))::numeric, 1)
  )
  INTO variability_data
  FROM public_glucose_data
  WHERE glucose_value IS NOT NULL
    AND (p_dataset IS NULL OR source_dataset = p_dataset)
    AND (p_age_range IS NULL OR age_range = p_age_range)
    AND (p_pump IS NULL OR pump_model = p_pump)
    AND (p_cgm IS NULL OR cgm_model = p_cgm)
    AND (p_region IS NULL OR location_region = p_region);

  -- Get time block analysis
  SELECT json_agg(block_stats ORDER BY block_order)
  INTO time_block_data
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
    WHERE glucose_value IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY 
      CASE 
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 0 AND 5 THEN 'Night'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11 THEN 'Morning'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 17 THEN 'Afternoon'
        ELSE 'Evening'
      END,
      CASE 
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 0 AND 5 THEN 1
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11 THEN 2
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 17 THEN 3
        ELSE 4
      END
  ) block_stats;

  -- Get insulin dose analysis
  SELECT json_agg(insulin_stats ORDER BY dose_order)
  INTO insulin_data
  FROM (
    SELECT 
      CASE 
        WHEN insulin_dose < 3 THEN '0-3u'
        WHEN insulin_dose < 6 THEN '3-6u'
        WHEN insulin_dose < 10 THEN '6-10u'
        ELSE '10u+'
      END as range,
      CASE 
        WHEN insulin_dose < 3 THEN 1
        WHEN insulin_dose < 6 THEN 2
        WHEN insulin_dose < 10 THEN 3
        ELSE 4
      END as dose_order,
      ROUND(AVG(glucose_value)::numeric, 1) as avg,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND insulin_dose IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY 
      CASE 
        WHEN insulin_dose < 3 THEN '0-3u'
        WHEN insulin_dose < 6 THEN '3-6u'
        WHEN insulin_dose < 10 THEN '6-10u'
        ELSE '10u+'
      END,
      CASE 
        WHEN insulin_dose < 3 THEN 1
        WHEN insulin_dose < 6 THEN 2
        WHEN insulin_dose < 10 THEN 3
        ELSE 4
      END
  ) insulin_stats;

  -- Get basal rate analysis
  SELECT json_agg(basal_stats ORDER BY basal_order)
  INTO basal_data
  FROM (
    SELECT 
      CASE 
        WHEN basal_rate < 0.8 THEN '<0.8 u/hr'
        WHEN basal_rate < 1.2 THEN '0.8-1.2 u/hr'
        ELSE '>1.2 u/hr'
      END as range,
      CASE 
        WHEN basal_rate < 0.8 THEN 1
        WHEN basal_rate < 1.2 THEN 2
        ELSE 3
      END as basal_order,
      ROUND(AVG(glucose_value)::numeric, 1) as avg,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND basal_rate IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY 
      CASE 
        WHEN basal_rate < 0.8 THEN '<0.8 u/hr'
        WHEN basal_rate < 1.2 THEN '0.8-1.2 u/hr'
        ELSE '>1.2 u/hr'
      END,
      CASE 
        WHEN basal_rate < 0.8 THEN 1
        WHEN basal_rate < 1.2 THEN 2
        ELSE 3
      END
  ) basal_stats;

  -- Get carb analysis
  SELECT json_agg(carb_stats ORDER BY carb_order)
  INTO carb_data
  FROM (
    SELECT 
      CASE 
        WHEN carbs < 30 THEN '<30g'
        WHEN carbs < 50 THEN '30-50g'
        WHEN carbs < 75 THEN '50-75g'
        ELSE '75g+'
      END as range,
      CASE 
        WHEN carbs < 30 THEN 1
        WHEN carbs < 50 THEN 2
        WHEN carbs < 75 THEN 3
        ELSE 4
      END as carb_order,
      ROUND(AVG(glucose_value)::numeric, 1) as avg,
      ROUND((COUNT(*) FILTER (WHERE glucose_value >= 70 AND glucose_value <= 180)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as tir,
      COUNT(*) as count
    FROM public_glucose_data
    WHERE glucose_value IS NOT NULL AND carbs IS NOT NULL
      AND (p_dataset IS NULL OR source_dataset = p_dataset)
      AND (p_age_range IS NULL OR age_range = p_age_range)
      AND (p_pump IS NULL OR pump_model = p_pump)
      AND (p_cgm IS NULL OR cgm_model = p_cgm)
      AND (p_region IS NULL OR location_region = p_region)
    GROUP BY 
      CASE 
        WHEN carbs < 30 THEN '<30g'
        WHEN carbs < 50 THEN '30-50g'
        WHEN carbs < 75 THEN '50-75g'
        ELSE '75g+'
      END,
      CASE 
        WHEN carbs < 30 THEN 1
        WHEN carbs < 50 THEN 2
        WHEN carbs < 75 THEN 3
        ELSE 4
      END
  ) carb_stats;

  -- Build final result
  SELECT json_build_object(
    'totalRecords', total_count,
    'uniqueUsers', unique_users,
    'hourlyAverages', COALESCE(hourly_data, '[]'::json),
    'rangeDistribution', range_data,
    'demographics', json_build_object(
      'byAge', COALESCE(age_breakdown, '[]'::json),
      'byRegion', COALESCE(region_breakdown, '[]'::json),
      'byPump', COALESCE(pump_breakdown, '[]'::json),
      'byCGM', COALESCE(cgm_breakdown, '[]'::json)
    ),
    'variability', variability_data,
    'timeBlocks', COALESCE(time_block_data, '[]'::json),
    'insulinAnalysis', json_build_object(
      'byDoseRange', COALESCE(insulin_data, '[]'::json),
      'byBasalRate', COALESCE(basal_data, '[]'::json)
    ),
    'carbAnalysis', COALESCE(carb_data, '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;