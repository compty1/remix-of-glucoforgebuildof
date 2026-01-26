-- Fix security warning: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_device_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices
  SET 
    avg_rating = (SELECT AVG(rating) FROM public.device_reviews WHERE device_id = COALESCE(NEW.device_id, OLD.device_id)),
    review_count = (SELECT COUNT(*) FROM public.device_reviews WHERE device_id = COALESCE(NEW.device_id, OLD.device_id))
  WHERE id = COALESCE(NEW.device_id, OLD.device_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;