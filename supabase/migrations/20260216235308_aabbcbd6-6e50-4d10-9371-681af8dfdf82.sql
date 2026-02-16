
-- 1. DELETE policy on connection_requests
CREATE POLICY "Users can delete their own connection requests"
ON public.connection_requests
FOR DELETE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- 2. Direct messages table
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
ON public.direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to accepted connections"
ON public.direct_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.connection_requests
    WHERE status = 'accepted'
    AND (
      (from_user_id = auth.uid() AND to_user_id = direct_messages.receiver_id)
      OR (to_user_id = auth.uid() AND from_user_id = direct_messages.receiver_id)
    )
  )
);

CREATE POLICY "Receivers can mark messages as read"
ON public.direct_messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- 3. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- 4. Notification trigger for new DMs
CREATE OR REPLACE FUNCTION public.notify_direct_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT display_name INTO sender_name
  FROM public.diabetic_profiles
  WHERE user_id = NEW.sender_id
  LIMIT 1;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.receiver_id,
    'direct_message',
    'New message from ' || COALESCE(sender_name, 'a connection'),
    LEFT(NEW.content, 100),
    '/find-diabetics'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_direct_message
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_direct_message();
