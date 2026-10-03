
CREATE TABLE public.daily_checkins (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  day date not null default (now() at time zone 'utc')::date,
  water_glasses integer not null default 0,
  sleep_hours numeric not null default 0,
  exercise_minutes integer not null default 0,
  meals integer not null default 0,
  mood_score integer not null default 5,
  screen_hours numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own daily checkins" ON public.daily_checkins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
