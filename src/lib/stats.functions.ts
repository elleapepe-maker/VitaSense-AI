import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type AppStats = {
  users: number;
  mood_checkins: number;
  daily_checkins: number;
  haven_messages: number;
  haven_memories: number;
  rituals_completed: number;
  symptom_sessions: number;
  reviews: number;
  avg_rating: number;
  avg_mood_score: number;
  avg_anxiety: number;
  first_week_mood: number;
  later_week_mood: number;
  mood_trend: { day: string; score: number; checkins: number }[];
};

export const getAppStats = createServerFn({ method: "GET" }).handler(async (): Promise<AppStats> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data, error } = await sb.rpc("public_app_stats");
  if (error || !data) {
    return {
      users: 0,
      mood_checkins: 0,
      daily_checkins: 0,
      haven_messages: 0,
      haven_memories: 0,
      rituals_completed: 0,
      symptom_sessions: 0,
      reviews: 0,
      avg_rating: 0,
      avg_mood_score: 0,
      avg_anxiety: 0,
      first_week_mood: 0,
      later_week_mood: 0,
      mood_trend: [],
    };
  }
  return data as AppStats;
});
