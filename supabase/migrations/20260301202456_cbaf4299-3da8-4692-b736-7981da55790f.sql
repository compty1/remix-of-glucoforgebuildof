
-- C12: Fix update_device_avg_rating trigger to call recalculate_device_ratings() 
-- instead of computing only from user reviews (which overwrites combined score)
CREATE OR REPLACE FUNCTION public.update_device_avg_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Call the combined recalculation function that includes external reviews
  PERFORM recalculate_device_ratings();
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- N34: Add index on external_device_reviews.device_id if missing
CREATE INDEX IF NOT EXISTS idx_external_device_reviews_device_id 
  ON public.external_device_reviews(device_id);

-- N35: Add index on external_medication_reviews.medication_id if missing
CREATE INDEX IF NOT EXISTS idx_external_medication_reviews_medication_id 
  ON public.external_medication_reviews(medication_id);
