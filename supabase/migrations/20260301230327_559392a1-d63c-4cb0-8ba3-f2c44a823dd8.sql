
-- Update recalculate_device_ratings() with adjusted sentiment scores (4.2/3.0/1.8)
CREATE OR REPLACE FUNCTION public.recalculate_device_ratings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  dev RECORD;
  ext_avg NUMERIC;
  ext_count INTEGER;
  user_avg NUMERIC;
  user_count INTEGER;
  combined_avg NUMERIC;
  combined_count INTEGER;
BEGIN
  FOR dev IN SELECT id FROM devices LOOP
    SELECT
      COALESCE(AVG(CASE sentiment
        WHEN 'positive' THEN 4.2
        WHEN 'neutral' THEN 3.0
        WHEN 'negative' THEN 1.8
        ELSE 3.0
      END), 0),
      COUNT(*)
    INTO ext_avg, ext_count
    FROM external_device_reviews
    WHERE device_id = dev.id;

    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO user_avg, user_count
    FROM device_reviews
    WHERE device_id = dev.id;

    combined_count := ext_count + user_count;

    IF combined_count > 0 THEN
      combined_avg := (ext_avg * ext_count + user_avg * user_count) / combined_count;
    ELSE
      combined_avg := NULL;
    END IF;

    UPDATE devices
    SET avg_rating = ROUND(combined_avg::numeric, 2),
        review_count = combined_count
    WHERE id = dev.id;
  END LOOP;
END;
$function$;

-- Update recalculate_medication_ratings() with adjusted sentiment scores (4.2/3.0/1.8)
CREATE OR REPLACE FUNCTION public.recalculate_medication_ratings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  med RECORD;
  ext_avg NUMERIC;
  ext_count INTEGER;
  user_avg NUMERIC;
  user_count INTEGER;
  combined_avg NUMERIC;
  combined_count INTEGER;
BEGIN
  FOR med IN SELECT id FROM medications LOOP
    SELECT
      COALESCE(AVG(CASE sentiment
        WHEN 'positive' THEN 4.2
        WHEN 'neutral' THEN 3.0
        WHEN 'negative' THEN 1.8
        ELSE 3.0
      END), 0),
      COUNT(*)
    INTO ext_avg, ext_count
    FROM external_medication_reviews
    WHERE medication_id = med.id;

    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO user_avg, user_count
    FROM medication_reviews
    WHERE medication_id = med.id;

    combined_count := ext_count + user_count;

    IF combined_count > 0 THEN
      combined_avg := (ext_avg * ext_count + user_avg * user_count) / combined_count;
    ELSE
      combined_avg := NULL;
    END IF;

    UPDATE medications
    SET avg_rating = ROUND(combined_avg::numeric, 2),
        review_count = combined_count
    WHERE id = med.id;
  END LOOP;
END;
$function$;
