import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Check, Flame } from "lucide-react";
import { RITUALS, ritualForMood, type Ritual } from "@/lib/rituals";
import { completeRitual, getRitualStats } from "@/lib/haven.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/rituals")({
  component: RitualsPage,
});

function RitualsPage() {
  const [mood, setMood] = useState<string | null>(null);
  const [stats, setStats] = useState<{ streak: number; total: number; todayCompletions: string[] } | null>(null);
  const [current, setCurrent] = useState<Ritual | null>(null);
  const [busy, setBusy] = useState(false);
  const doComplete = useServerFn(completeRitual);
  const loadStats = useServerFn(getRitualStats);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("mood_checkins")
        .select("mood")
        .eq("user_id", u.user.id)
        .not("mood", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setMood(data?.mood ?? null);
      const s = await loadStats({});
      setStats(s);
      setCurrent(ritualForMood(data?.mood ?? null, s.todayCompletions));
    })();
  }, [loadStats]);

  const finish = async () => {
    if (!current) return;
    setBusy(true);
    try {
      await doComplete({ data: { ritualId: current.id } });
      toast.success("Ritual complete 🌸");
      const s = await loadStats({});
      setStats(s);
      setCurrent(ritualForMood(mood, s.todayCompletions));
    } catch {
      toast.error("Couldn't save that one");
    } finally {
      setBusy(false);
    }
  };

  const shuffle = () => {
    if (!stats) return;
    // pick a different one
    const pool = RITUALS.filter((r) => r.id !== current?.id && !stats.todayCompletions.includes(r.id));
    if (pool.length === 0) return;
    setCurrent(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <div className="pt-4 space-y-5 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Daily Rituals</h1>
        <p className="text-sm text-muted-foreground">Tiny 2-minute practices, chosen for how you feel today.</p>
      </div>

      {stats && (
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-butter flex items-center justify-center soft-shadow">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ritual streak</div>
            <div className="font-display text-3xl font-bold text-gradient-pink">{stats.streak} <span className="text-base font-sans text-muted-foreground">{stats.streak === 1 ? "day" : "days"}</span></div>
            <div className="text-xs text-muted-foreground">{stats.todayCompletions.length} done today · {stats.total} all-time</div>
          </div>
        </div>
      )}

      {current && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today's ritual{mood ? ` · matches "${mood}"` : ""}</div>
              <div className="font-display text-2xl font-bold mt-1">{current.emoji} {current.title}</div>
              <div className="text-xs text-muted-foreground">~{current.minutes} min</div>
            </div>
            <button onClick={shuffle} className="text-xs font-semibold text-primary rounded-full bg-white/80 border border-white px-3 py-1.5">Shuffle</button>
          </div>
          <ol className="space-y-2">
            {current.steps.map((s, i) => (
              <li key={i} className="flex gap-3 bg-white/70 rounded-2xl p-3 border border-white text-sm">
                <span className="font-display font-bold text-primary">{i + 1}.</span>
                <span className="flex-1">{s}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-center italic text-muted-foreground">{current.closer}</p>
          <button onClick={finish} disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-2xl gradient-pink text-white font-semibold py-3 soft-shadow disabled:opacity-50">
            <Check className="w-4 h-4" /> I did it
          </button>
        </div>
      )}

      <div className="glass-card p-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1"><Sparkles className="w-3 h-3" /> All rituals</div>
        <div className="grid grid-cols-2 gap-2">
          {RITUALS.map((r) => {
            const done = stats?.todayCompletions.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => setCurrent(r)}
                className={`text-left rounded-2xl p-3 border transition ${done ? "bg-white/50 border-white/50 opacity-60" : "bg-white/70 border-white hover:bg-white"}`}
              >
                <div className="text-lg">{r.emoji}</div>
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-[11px] text-muted-foreground">{r.minutes} min {done && "· done today ✓"}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
