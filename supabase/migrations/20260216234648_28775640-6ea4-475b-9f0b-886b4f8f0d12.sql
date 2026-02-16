
-- Trigger function to create notifications for connection requests
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
  accepter_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Look up sender's display name
    SELECT display_name INTO sender_name
    FROM public.diabetic_profiles
    WHERE user_id = NEW.from_user_id;

    INSERT INTO public.notifications (user_id, type, title, message, link, icon)
    VALUES (
      NEW.to_user_id,
      'connection_request',
      'New Connection Request',
      COALESCE(sender_name, 'Someone') || ' wants to connect with you!',
      '/find-diabetics',
      '🤝'
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Look up accepter's display name
    SELECT display_name INTO accepter_name
    FROM public.diabetic_profiles
    WHERE user_id = NEW.to_user_id;

    INSERT INTO public.notifications (user_id, type, title, message, link, icon)
    VALUES (
      NEW.from_user_id,
      'connection_request',
      'Connection Accepted!',
      COALESCE(accepter_name, 'Someone') || ' accepted your connection request!',
      '/find-diabetics',
      '🤝'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on connection_requests
CREATE TRIGGER trg_notify_connection_request
AFTER INSERT OR UPDATE ON public.connection_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_connection_request();
