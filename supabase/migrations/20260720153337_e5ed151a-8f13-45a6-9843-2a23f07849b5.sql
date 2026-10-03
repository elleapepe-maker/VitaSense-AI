
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS haven_personality TEXT DEFAULT 'gentle_guide';

CREATE TABLE IF NOT EXISTS public.haven_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  kind TEXT DEFAULT 'note',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.haven_memories TO authenticated;
GRANT ALL ON public.haven_memories TO service_role;
ALTER TABLE public.haven_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memories" ON public.haven_memories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS haven_memories_user_created ON public.haven_memories(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL,
  patterns JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reports TO authenticated;
GRANT ALL ON public.weekly_reports TO service_role;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.weekly_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id TEXT NOT NULL,
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ritual_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ritual_completions TO authenticated;
GRANT ALL ON public.ritual_completions TO service_role;
ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rituals" ON public.ritual_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS ritual_completions_user_day ON public.ritual_completions(user_id, day DESC);
