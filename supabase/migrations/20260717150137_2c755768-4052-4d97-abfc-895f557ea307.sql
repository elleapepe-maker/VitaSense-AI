
-- Friend wellness tasks and shared streaks
-- We derive tasks from existing daily_checkins + mood_checkins.
-- A "wellness day" for user U on date D means: they logged a mood check-in
-- OR completed at least one daily_checkin metric that day.
-- Shared streak between two friends = # of consecutive days ending today
-- (or yesterday) where BOTH had a wellness day.

CREATE OR REPLACE FUNCTION public.friend_wellness_streak(_friend_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  is_friend boolean;
  d date := (now() AT TIME ZONE 'UTC')::date;
  streak int := 0;
  me_active boolean;
  fr_active boolean;
BEGIN
  IF me IS NULL THEN RETURN 0; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = me AND f.addressee_id = _friend_id)
        OR (f.requester_id = _friend_id AND f.addressee_id = me))
  ) INTO is_friend;
  IF NOT is_friend THEN RETURN 0; END IF;

  -- Allow starting from yesterday if today has no activity yet.
  FOR i IN 0..365 LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.mood_checkins m
      WHERE m.user_id = me AND (m.created_at AT TIME ZONE 'UTC')::date = d
    ) OR EXISTS (
      SELECT 1 FROM public.daily_checkins c
      WHERE c.user_id = me AND c.day = d
    ) INTO me_active;

    SELECT EXISTS (
      SELECT 1 FROM public.mood_checkins m
      WHERE m.user_id = _friend_id AND (m.created_at AT TIME ZONE 'UTC')::date = d
    ) OR EXISTS (
      SELECT 1 FROM public.daily_checkins c
      WHERE c.user_id = _friend_id AND c.day = d
    ) INTO fr_active;

    IF me_active AND fr_active THEN
      streak := streak + 1;
    ELSE
      -- Allow today to be missing without breaking streak; break otherwise.
      IF i = 0 THEN
        d := d - 1;
        CONTINUE;
      END IF;
      EXIT;
    END IF;

    d := d - 1;
  END LOOP;

  RETURN streak;
END;
$$;

REVOKE ALL ON FUNCTION public.friend_wellness_streak(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.friend_wellness_streak(uuid) TO authenticated;
