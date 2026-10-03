
-- Ensure usernames are unique when set
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx ON public.profiles (LOWER(username)) WHERE username IS NOT NULL;

-- Friendships
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_not_self CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own friendships" ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "send friend requests" ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "respond to requests" ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = addressee_id OR auth.uid() = requester_id);
CREATE POLICY "cancel or remove friendship" ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Safe search RPC (SECURITY DEFINER exposes only safe columns)
CREATE OR REPLACE FUNCTION public.search_users(q text)
RETURNS TABLE (id uuid, display_name text, username text, avatar_emoji text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.username, p.avatar_emoji
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND length(coalesce(q,'')) >= 2
    AND (
      p.username ILIKE '%' || q || '%'
      OR p.display_name ILIKE '%' || q || '%'
    )
  LIMIT 15;
$$;

GRANT EXECUTE ON FUNCTION public.search_users(text) TO authenticated;
