-- 1. Alias any review whose display name looks like the creator's first name
CREATE OR REPLACE FUNCTION public.reviews_alias_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  aliases text[] := ARRAY['Mommy','Zehra','Ali','Subeeka','Husnain','Kareem','Aanya','Avery'];
BEGIN
  IF NEW.display_name IS NOT NULL AND NEW.display_name ILIKE '%ellea%' THEN
    NEW.display_name := aliases[1 + floor(random() * array_length(aliases, 1))::int];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_alias_name_trg ON public.reviews;
CREATE TRIGGER reviews_alias_name_trg
BEFORE INSERT OR UPDATE OF display_name ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.reviews_alias_name();

-- 2. Replies on reviews
CREATE TABLE public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_name text,
  author_emoji text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_replies TO authenticated;
GRANT SELECT ON public.review_replies TO anon;
GRANT ALL ON public.review_replies TO service_role;

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view replies on featured reviews"
ON public.review_replies FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.feature_on_home = true));

CREATE POLICY "Owner and creator can view replies"
ON public.review_replies FOR SELECT TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.user_id = auth.uid())
  OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'ellea.pepe@gmail.com'
);

CREATE POLICY "Owner or creator can add replies"
ON public.review_replies FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (
    EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.user_id = auth.uid())
    OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'ellea.pepe@gmail.com'
  )
);

CREATE POLICY "Authors can update own replies"
ON public.review_replies FOR UPDATE TO authenticated
USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own replies"
ON public.review_replies FOR DELETE TO authenticated
USING (author_id = auth.uid());

CREATE TRIGGER review_replies_updated_at
BEFORE UPDATE ON public.review_replies
FOR EACH ROW EXECUTE FUNCTION public.reviews_set_updated_at();

-- 3. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'review_reply',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own notifications select"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Own notifications update"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own notifications delete"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX review_replies_review_idx ON public.review_replies (review_id, created_at);

-- 4. Notify the review owner when someone replies
CREATE OR REPLACE FUNCTION public.notify_review_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner uuid;
BEGIN
  SELECT user_id INTO owner FROM public.reviews WHERE id = NEW.review_id;
  IF owner IS NOT NULL AND owner <> NEW.author_id THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (owner, 'review_reply',
            coalesce(NEW.author_name, 'Someone') || ' replied to your review 💬',
            left(NEW.body, 160), '/profile');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_review_reply_trg
AFTER INSERT ON public.review_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_review_reply();