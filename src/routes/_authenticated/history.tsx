import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MoodBloom } from "@/components/MoodBloom";
import { useTheme } from "@/lib/theme";
import { Sparkles, Calendar, TrendingUp, Eye, EyeOff, Award, Trophy, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  component: History,
});


type MoodRow = {
  id: string;
  created_at: string;
  kind: string;
  mood: string | null;
  anxiety_score: number | null;
  notes: string | null;
  tips: string | null;
};

type CheckinRow = {
  id: string;
  day: string;
  water_glasses: number;
  sleep_hours: number;
  exercise_minutes: number;
  meals: number;
  mood_score: number;
  screen_hours: number;
};

const MOOD_ORDER = ["Great", "Good", "Meh", "Low", "Overwhelmed"] as const;

function formatDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function scoreForCheckin(c: CheckinRow) {
  let s = 0;
  s += Math.min(c.water_glasses / 8, 1) * 20;
  s += Math.min(c.sleep_hours / 8, 1) * 25;
  s += Math.min(c.exercise_minutes / 30, 1) * 20;
  s += Math.min(c.meals / 3, 1) * 15;
  s += (c.mood_score / 10) * 15;
  s += Math.max(0, 1 - c.screen_hours / 8) * 5;
  return Math.round(s);
}

function History() {
  const { theme } = useTheme();
  const isCar = theme === "masculine";
  const [moods, setMoods] = useState<MoodRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [blurred, setBlurred] = useState(false);


  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [m, c] = await Promise.all([
        supabase.from("mood_checkins").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(60),
        supabase.from("daily_checkins").select("*").eq("user_id", u.user.id).order("day", { ascending: false }).limit(30),
      ]);
      setMoods((m.data ?? []) as MoodRow[]);
      setCheckins((c.data ?? []) as CheckinRow[]);
      setLoading(false);
    })();
  }, []);

  const todaysMood = moods.find((m) => m.mood)?.mood as (typeof MOOD_ORDER)[number] | undefined;

  const moodCounts = MOOD_ORDER.map((label) => ({
    label,
    count: moods.filter((m) => m.mood === label).length,
  }));
  const total = moodCounts.reduce((a, b) => a + b.count, 0) || 1;

  const streak = (() => {
    // count consecutive days (starting today going back) where the latest mood was Great
    const byDay = new Map<string, string>();
    for (const m of moods) {
      if (!m.mood) continue;
      const day = new Date(m.created_at).toDateString();
      if (!byDay.has(day)) byDay.set(day, m.mood);
    }
    let s = 0;
    const d = new Date();
    // allow starting from today or yesterday
    while (true) {
      const key = d.toDateString();
      const mood = byDay.get(key);
      if (mood === "Great") { s++; d.setDate(d.getDate() - 1); continue; }
      if (s === 0 && !mood) { d.setDate(d.getDate() - 1); if (Math.abs(new Date().getTime() - d.getTime()) < 36 * 3600_000) continue; }
      break;
    }
    return s;
  })();

  const scoreTrend = [...checkins].reverse().map((c) => ({ day: c.day, score: scoreForCheckin(c) }));

  // Weekly garden: last 7 days (today first)
  const moodByDay = new Map<string, string>();
  for (const m of moods) {
    if (!m.mood) continue;
    const key = new Date(m.created_at).toISOString().slice(0, 10);
    if (!moodByDay.has(key)) moodByDay.set(key, m.mood);
  }
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }), mood: moodByDay.get(key) ?? null };
  }).reverse();

  // Achievements
  const daysLogged = new Set(moods.map((m) => new Date(m.created_at).toISOString().slice(0, 10))).size;
  const greatDaysTotal = moods.filter((m) => m.mood === "Great").length;
  const waterGoalDays = checkins.filter((c) => c.water_glasses >= 8).length;
  const sleepGoalDays = checkins.filter((c) => Number(c.sleep_hours) >= 7).length;
  const moveGoalDays = checkins.filter((c) => c.exercise_minutes >= 20).length;
  const badges = [
    { key: "first-bloom", label: "First bloom", desc: "Your first mood check-in", emoji: "🌱", unlocked: moods.length >= 1 },
    { key: "week-warrior", label: "Week of care", desc: "Checked in 7 different days", emoji: "🌸", unlocked: daysLogged >= 7 },
    { key: "three-great", label: "3 great days", desc: "Logged 'Great' 3 times", emoji: "🌈", unlocked: greatDaysTotal >= 3 },
    { key: "streak-3", label: "3-day streak", desc: "3 great days in a row", emoji: "🔥", unlocked: streak >= 3 },
    { key: "hydration", label: "Hydration hero", desc: "Hit 8+ glasses on 5 days", emoji: "💧", unlocked: waterGoalDays >= 5 },
    { key: "rested", label: "Well rested", desc: "7+ hrs sleep on 5 days", emoji: "🌙", unlocked: sleepGoalDays >= 5 },
    { key: "mover", label: "Gentle mover", desc: "20+ min movement on 5 days", emoji: "🌷", unlocked: moveGoalDays >= 5 },
    { key: "haven", label: "Haven confidant", desc: "Opened up in a check-in", emoji: "💫", unlocked: moods.some((m) => !!m.notes) },
  ];

  return (
    <div className="pt-4 space-y-4 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Your journey {isCar ? "🏁" : "🌸"}</h1>
        <p className="text-sm text-muted-foreground">A timeline of your progress and how you've been feeling.</p>
      </div>

      {/* Quick jump to today's ritual + weekly glow */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/rituals" className="glass-card p-4 hover:scale-[1.01] transition">
          <div className="text-2xl mb-1">🌿</div>
          <div className="font-display font-bold text-sm">Today's ritual</div>
          <div className="text-[11px] text-muted-foreground">Tiny 2-min practice</div>
        </Link>
        <Link to="/weekly-glow" className="glass-card p-4 hover:scale-[1.01] transition">
          <div className="text-2xl mb-1">🪞</div>
          <div className="font-display font-bold text-sm">Weekly glow</div>
          <div className="text-[11px] text-muted-foreground">Your week, reflected</div>
        </Link>
      </div>


      {/* Today's bloom / ride */}
      <div className="glass-card p-6 flex flex-col items-center text-center">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {isCar ? "Today's ride" : "Today's flower"}
        </div>
        <MoodBloom mood={todaysMood ?? null} size={160} />
        <div className="mt-2 font-display text-2xl font-bold">
          {todaysMood ? `Feeling ${todaysMood}` : isCar ? "Do a mood check-in to fuel up 🏎️" : "Do a mood check-in to bloom 🌱"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {isCar ? "Your ride changes with how you're feeling each day." : "Your flower changes with how you're feeling each day."}
        </div>
      </div>

      {/* Key */}
      <div className="glass-card p-5">
        <div className="font-display font-bold text-lg mb-1">
          {isCar ? "Your ride key 🏁" : "Your flower key 🌼"}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {isCar
            ? "Here's what each ride means — and how to get to fully gold."
            : "Here's what each bloom means — and how to grow into a fully gold flower."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(isCar
            ? [
                { mood: "Great", desc: "All gold — top gear, glowing." },
                { mood: "Good", desc: "Gold body with green accents." },
                { mood: "Meh", desc: "Gold body with green headlights and spoiler." },
                { mood: "Low", desc: "Half gold, half green body." },
                { mood: "Overwhelmed", desc: "All green body with gold wheels holding you up." },
              ]
            : [
                { mood: "Great", desc: "All gold — you're glowing." },
                { mood: "Good", desc: "Gold petals with a soft pink center." },
                { mood: "Meh", desc: "Gold petals with pink tips." },
                { mood: "Low", desc: "Half pink, half gold petals." },
                { mood: "Overwhelmed", desc: "All pink petals, gold stem holding you up." },
              ]
          ).map((f) => (
            <div key={f.mood} className="flex items-center gap-3 bg-white/60 rounded-2xl p-3 border border-white">
              <MoodBloom mood={f.mood as never} size={56} />
              <div>
                <div className="font-semibold text-sm">{f.mood}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-white/70 rounded-2xl p-3 border border-white">
          <div className="font-semibold text-sm mb-1">
            {isCar ? "Drive toward all-gold 🏆" : "Grow toward all-gold 💛"}
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
            <li>Check in with Mood daily so your {isCar ? "ride" : "flower"} can {isCar ? "shine" : "bloom"}.</li>
            <li>Log water, sleep, meals & exercise on your Schedule.</li>
            <li>Chat with Haven💫 when things feel heavy — you're not alone.</li>
            <li>Try the anxiety quiz and follow the tips it gives you.</li>
            <li>Aim for consistent sleep and small joyful moments each day.</li>
          </ul>
        </div>
      </div>

      {/* Weekly garden / garage */}
      <div className="glass-card p-5">
        <div className="font-display font-bold text-lg mb-1">
          {isCar ? "Your weekly garage 🏎️" : "Your weekly garden 🌷"}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {isCar ? "A ride for every day this week." : "A little bloom for every day this week."}
        </p>
        <div className="grid grid-cols-7 gap-1">
          {week.map((d) => (
            <div key={d.key} className="flex flex-col items-center">
              <MoodBloom mood={(d.mood as never) ?? null} size={44} />
              <div className="text-[10px] font-semibold mt-1">{d.label}</div>
            </div>
          ))}
        </div>
      </div>


      {/* Achievements */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          {isCar ? <Trophy className="w-4 h-4 text-primary" /> : <Award className="w-4 h-4 text-primary" />}
          <div className="font-display font-bold text-lg">{isCar ? "Wins" : "Achievements"}</div>
          <span className="ml-auto text-xs text-muted-foreground">{badges.filter((b) => b.unlocked).length}/{badges.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {badges.map((b) => (
            <div key={b.key} className={`rounded-2xl p-3 text-center border ${b.unlocked ? "gradient-pink text-white border-white soft-shadow" : "bg-white/50 border-white text-muted-foreground opacity-70"}`}>
              <div className={`text-2xl ${b.unlocked ? "" : "grayscale"}`}>{b.emoji}</div>
              <div className="text-xs font-semibold mt-1">{b.label}</div>
              <div className="text-[10px] mt-0.5 opacity-80 leading-tight">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{isCar ? <Trophy className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />} Great-day streak</div>
          <div className="font-display text-3xl font-bold text-gradient-pink mt-1">{streak}<span className="text-sm text-muted-foreground ml-1">days</span></div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Check-ins</div>
          <div className="font-display text-3xl font-bold mt-1">{moods.length}</div>
        </div>
      </div>


      {/* Mood distribution */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          {isCar ? <Activity className="w-4 h-4 text-primary" /> : <TrendingUp className="w-4 h-4 text-primary" />}
          <div className="font-display font-bold text-lg">Mood distribution</div>
        </div>
        <div className="space-y-2">
          {moodCounts.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-24 text-xs font-semibold">{m.label}</div>
              <div className="flex-1 h-3 rounded-full bg-white/70 overflow-hidden">
                <div className="h-full gradient-pink" style={{ width: `${(m.count / total) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-xs text-muted-foreground">{m.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health score trend */}
      {scoreTrend.length > 0 && (
        <div className="glass-card p-5">
          <div className="font-display font-bold text-lg mb-3">Health score trend</div>
          <div className="flex items-end gap-1 h-32">
            {scoreTrend.map((s) => (
              <div
                key={s.day}
                className="flex-1 gradient-pink rounded-t-md"
                style={{ height: `${Math.max(s.score, 4)}%`, minHeight: 4 }}
                title={`${s.day}: ${s.score}`}
              />
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 text-center">Last {scoreTrend.length} logged days</div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-bold text-lg">Timeline</div>
          <button
            onClick={() => setBlurred((b) => !b)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/70 hover:bg-white border border-white rounded-full px-3 py-1.5 transition"
            title={blurred ? "Show your responses" : "Hide your responses"}
          >
            {blurred ? <><Eye className="w-3.5 h-3.5" /> Show responses</> : <><EyeOff className="w-3.5 h-3.5" /> Blur responses</>}
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading your story...</div>
        ) : moods.length === 0 ? (
          <div className="text-sm text-muted-foreground">No check-ins yet. Head to the Mood tab to start 🌸</div>
        ) : (
          <ol className="relative border-l-2 border-primary/30 ml-2 space-y-4">
            {moods.map((m) => (
              <li key={m.id} className="pl-4 relative">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full gradient-pink border-2 border-white" />
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-muted-foreground">{formatDay(m.created_at)}</div>
                  {m.mood && <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 border border-white font-semibold">{m.mood}</span>}
                  {m.anxiety_score != null && <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 border border-white font-semibold">Anxiety {m.anxiety_score}/10</span>}
                </div>
                {m.notes && <div className={`text-sm mt-1 italic transition ${blurred ? "blur-sm select-none" : ""}`}>"{m.notes}"</div>}
                {m.tips && <div className={`text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-line transition ${blurred ? "blur-sm select-none" : ""}`}>{m.tips}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
