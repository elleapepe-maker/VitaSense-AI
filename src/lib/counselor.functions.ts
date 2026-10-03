import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CounselorDay = {
  day: string;
  anxiety: number | null;
  mood: string | null;
  moodScore: number | null;
  sleep: number | null;
  water: number | null;
  exercise: number | null;
  screen: number | null;
};

export type CounselorReport = {
  generated_at: string;
  student_name: string;
  days: CounselorDay[];
  averages: {
    anxiety: number | null;
    moodScore: number | null;
    sleep: number | null;
    water: number | null;
    exercise: number | null;
    screen: number | null;
  };
  anxietyCheckins: number;
  highAnxietyDays: number;
  lastWeekAnxietyAvg: number | null;
  /** True when the last 7 days of anxiety scores stayed very high. */
  elevatedWeek: boolean;
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function avg(values: number[]) {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export const getCounselorReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CounselorReport> => {
    const sb = context.supabase;
    const since = new Date(Date.now() - 29 * 86400000);
    const sinceDay = dayKey(since);

    const [profile, moods, checkins] = await Promise.all([
      sb.from("profiles").select("display_name").eq("id", context.userId).maybeSingle(),
      sb
        .from("mood_checkins")
        .select("created_at, kind, mood, anxiety_score")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      sb
        .from("daily_checkins")
        .select("day, mood_score, sleep_hours, water_glasses, exercise_minutes, screen_hours")
        .gte("day", sinceDay)
        .order("day", { ascending: true }),
    ]);

    const byDay = new Map<string, CounselorDay>();
    for (let i = 0; i < 30; i++) {
      const d = dayKey(new Date(since.getTime() + i * 86400000));
      byDay.set(d, {
        day: d,
        anxiety: null,
        mood: null,
        moodScore: null,
        sleep: null,
        water: null,
        exercise: null,
        screen: null,
      });
    }

    for (const m of moods.data ?? []) {
      const d = String(m.created_at).slice(0, 10);
      const row = byDay.get(d);
      if (!row) continue;
      if (typeof m.anxiety_score === "number") row.anxiety = m.anxiety_score;
      if (m.mood) row.mood = m.mood;
    }

    for (const c of checkins.data ?? []) {
      const row = byDay.get(String(c.day).slice(0, 10));
      if (!row) continue;
      row.moodScore = c.mood_score ?? null;
      row.sleep = c.sleep_hours ?? null;
      row.water = c.water_glasses ?? null;
      row.exercise = c.exercise_minutes ?? null;
      row.screen = c.screen_hours ?? null;
    }

    const days = [...byDay.values()];
    const num = (pick: (r: CounselorDay) => number | null) =>
      days.map(pick).filter((v): v is number => typeof v === "number");

    const anxietyValues = num((r) => r.anxiety);
    const lastWeek = days.slice(-7);
    const lastWeekAnx = lastWeek.map((r) => r.anxiety).filter((v): v is number => typeof v === "number");
    const lastWeekAvg = avg(lastWeekAnx);

    return {
      generated_at: new Date().toISOString(),
      student_name: profile.data?.display_name ?? "VitaSense user",
      days,
      averages: {
        anxiety: avg(anxietyValues),
        moodScore: avg(num((r) => r.moodScore)),
        sleep: avg(num((r) => r.sleep)),
        water: avg(num((r) => r.water)),
        exercise: avg(num((r) => r.exercise)),
        screen: avg(num((r) => r.screen)),
      },
      anxietyCheckins: anxietyValues.length,
      highAnxietyDays: anxietyValues.filter((v) => v >= 7).length,
      lastWeekAnxietyAvg: lastWeekAvg,
      elevatedWeek: lastWeekAnx.length >= 3 && (lastWeekAvg ?? 0) >= 7,
    };
  });
