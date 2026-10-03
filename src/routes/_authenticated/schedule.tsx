import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplet, Moon, Footprints, Utensils, Smile, Monitor, Save, Bed, Dumbbell, Beef, Zap, Trophy } from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/schedule")({
  component: SchedulePage,
});

const today = () => new Date().toISOString().slice(0, 10);

function SchedulePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const masc = theme === "masculine";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    water_glasses: 4,
    sleep_hours: 7,
    exercise_minutes: 20,
    meals: 3,
    mood_score: 7,
    screen_hours: 4,
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", u.user.id)
        .eq("day", today())
        .maybeSingle();
      if (data) {
        setForm({
          water_glasses: data.water_glasses,
          sleep_hours: Number(data.sleep_hours),
          exercise_minutes: data.exercise_minutes,
          meals: data.meals,
          mood_score: data.mood_score,
          screen_hours: Number(data.screen_hours),
          notes: data.notes ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("daily_checkins")
      .upsert(
        { user_id: u.user.id, day: today(), ...form, updated_at: new Date().toISOString() },
        { onConflict: "user_id,day" },
      );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Today's schedule saved 💗");
    navigate({ to: "/dashboard" });
  };

  if (loading) return <div className="pt-10 text-center text-muted-foreground animate-pulse">Loading today...</div>;

  return (
    <div className="pt-4 space-y-5 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Today's schedule</h1>
        <p className="text-sm text-muted-foreground">Edit this each day — your health score reflects what you log here.</p>
      </div>

      <div className="glass-card p-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How to log your day 💗</div>
        <ol className="text-sm space-y-1.5 list-decimal list-inside text-foreground/80">
          <li>Slide each bar to match what you actually did today — no judgment, just honesty.</li>
          <li><span className="font-semibold">Water:</span> count glasses (aim for around 8).</li>
          <li><span className="font-semibold">Sleep:</span> hours you got last night (7–9 is a sweet spot).</li>
          <li><span className="font-semibold">Movement:</span> total minutes moving — walks, stretching, workouts all count.</li>
          <li><span className="font-semibold">Meals:</span> how many balanced meals you had (aim for 3).</li>
          <li><span className="font-semibold">Mood:</span> 1 = rough day, 10 = shining.</li>
          <li><span className="font-semibold">Screen time:</span> hours on phone/computer (lower is gentler on you).</li>
          <li>Add a note if something stood out, then tap <span className="font-semibold">Save today</span>. Come back and update anytime — your score refreshes instantly. 🌸</li>
        </ol>
      </div>


      <div className="space-y-3">
        <Slider icon={Droplet} label="Water" tint="gradient-mint" value={form.water_glasses} min={0} max={12} step={1} unit="glasses"
          onChange={(v) => setForm({ ...form, water_glasses: v })} />
        <Slider icon={masc ? Bed : Moon} label="Sleep last night" tint="gradient-lavender" value={form.sleep_hours} min={0} max={12} step={0.5} unit="hrs"
          onChange={(v) => setForm({ ...form, sleep_hours: v })} />
        <Slider icon={masc ? Dumbbell : Footprints} label="Exercise / movement" tint="gradient-pink" value={form.exercise_minutes} min={0} max={120} step={5} unit="min"
          onChange={(v) => setForm({ ...form, exercise_minutes: v })} />
        <Slider icon={masc ? Beef : Utensils} label="Balanced meals" tint="gradient-butter" value={form.meals} min={0} max={5} step={1} unit="today"
          onChange={(v) => setForm({ ...form, meals: v })} />
        <Slider icon={masc ? Zap : Smile} label="How you feel" tint="gradient-pink" value={form.mood_score} min={1} max={10} step={1} unit="/ 10"
          onChange={(v) => setForm({ ...form, mood_score: v })} />
        <Slider icon={Monitor} label="Screen time" tint="gradient-lavender" value={form.screen_hours} min={0} max={16} step={0.5} unit="hrs"
          onChange={(v) => setForm({ ...form, screen_hours: v })} />
      </div>

      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Notes (optional)</div>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-2xl bg-white/80 border border-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[80px]"
          placeholder="Anything you want to remember about today..."
        />
      </div>

      <button onClick={save} disabled={saving}
        className="w-full rounded-2xl gradient-pink text-white font-semibold py-4 soft-shadow disabled:opacity-60 flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save today"}
      </button>
    </div>
  );
}

function Slider({ icon: Icon, label, tint, value, min, max, step, unit, onChange }: {
  icon: typeof Droplet; label: string; tint: string;
  value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${tint} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="font-semibold text-sm">{label}</div>
        </div>
        <div className="font-display text-xl font-bold">
          {value}<span className="text-xs font-sans text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary" />
    </div>
  );
}
