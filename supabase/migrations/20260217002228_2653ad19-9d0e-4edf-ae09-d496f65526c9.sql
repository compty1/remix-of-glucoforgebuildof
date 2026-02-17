
-- Bug 8: Prevent self-requests
ALTER TABLE connection_requests
  ADD CONSTRAINT chk_no_self_request CHECK (from_user_id <> to_user_id);

-- Bug 9: Prevent duplicate pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_request
  ON connection_requests(from_user_id, to_user_id) WHERE status = 'pending';

-- Bug 10: Debounce DM notifications
CREATE OR REPLACE FUNCTION public.notify_direct_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  sender_name TEXT;
  recent_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.notifications
    WHERE user_id = NEW.receiver_id
      AND type = 'direct_message'
      AND is_read = false
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) INTO recent_exists;

  IF NOT recent_exists THEN
    SELECT display_name INTO sender_name
    FROM public.diabetic_profiles
    WHERE user_id = NEW.sender_id LIMIT 1;

    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.receiver_id, 'direct_message',
      'New message from ' || COALESCE(sender_name, 'a connection'),
      LEFT(NEW.content, 100),
      '/find-diabetics'
    );
  END IF;
  RETURN NEW;
END;
$$;
