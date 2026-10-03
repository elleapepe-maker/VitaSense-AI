CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own dms" ON public.direct_messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "send dms to friends" ON public.direct_messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = auth.uid() AND f.addressee_id = recipient_id)
        OR (f.addressee_id = auth.uid() AND f.requester_id = recipient_id))
  )
);

CREATE POLICY "mark received dms read" ON public.direct_messages
FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "delete own sent dms" ON public.direct_messages
FOR DELETE TO authenticated
USING (auth.uid() = sender_id);

CREATE INDEX direct_messages_pair_idx ON public.direct_messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX direct_messages_recipient_idx ON public.direct_messages (recipient_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

CREATE OR REPLACE FUNCTION public.notify_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT COALESCE(display_name, 'A friend') INTO sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (NEW.recipient_id, 'direct_message',
          COALESCE(sender_name, 'A friend') || ' sent you a message 💬',
          left(NEW.body, 160), '/messages');
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_direct_message_trg
AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_direct_message();

CREATE OR REPLACE FUNCTION public.notify_review_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target uuid;
BEGIN
  FOR target IN
    SELECT DISTINCT p FROM (
      SELECT r.user_id AS p FROM public.reviews r WHERE r.id = NEW.review_id
      UNION
      SELECT rr.author_id AS p FROM public.review_replies rr WHERE rr.review_id = NEW.review_id
    ) s
    WHERE p IS NOT NULL AND p <> NEW.author_id
  LOOP
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (target, 'review_reply',
            COALESCE(NEW.author_name, 'Someone') || ' replied on a rating 💬',
            left(NEW.body, 160), '/profile');
  END LOOP;
  RETURN NEW;
END;
$$;