import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const AVATARS = ["🌸", "🦋", "🌷", "☁️", "🍑", "🪷", "🌙", "⭐️", "⚽️", "🎾", "🥭", "🍓", "❤️‍🔥", "🐦‍⬛", "🦅", "🏎️"];
const HOBBY_OPTIONS = ["Reading", "Music", "Art", "Gaming", "Cooking", "Photography", "Journaling", "Baking"];
const ACTIVITY_OPTIONS = [
  "Walking", "Yoga", "Running", "Dance", "Cycling", "Pilates", "Swimming", "Weights",
  "Soccer", "Basketball", "Tennis", "Volleyball", "Track", "Football", "Softball", "Baseball",
  "Cheer", "Gymnastics", "Martial arts", "Skating", "Hiking", "Golf", "Wrestling", "Badminton",
];


function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState("🌸");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [otherActivities, setOtherActivities] = useState("");

  const [routine, setRoutine] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata as { display_name?: string } | undefined;
      if (meta?.display_name) setName(meta.display_name);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user!.id).maybeSingle();
      if (p?.onboarded) navigate({ to: "/dashboard" });
      else if (p?.display_name) setName(p.display_name);
    })();
  }, [navigate]);

  const finish = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({
      id: u.user!.id,
      display_name: name,
      username: username || null,
      age: age === "" ? null : Number(age),
      gender: gender || null,
      avatar_emoji: avatar,
      hobbies,
      activities: Array.from(new Set([
        ...activities,
        ...otherActivities.split(",").map((s) => s.trim()).filter(Boolean),
      ])),

      daily_routine: routine || null,
      onboarded: true,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Welcome to VitaSense AI, ${name}! 🌸`);
    navigate({ to: "/dashboard" });
  };

  const canNext =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && age !== "" && gender) ||
    (step === 2) ||
    (step === 3);

  return (
    <div className="pt-6">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl font-bold">Let's get to know you</h1>
        <p className="text-muted-foreground text-sm">Step {step + 1} of 4</p>
        <div className="mt-3 h-1.5 rounded-full bg-white/70 max-w-xs mx-auto overflow-hidden">
          <div className="h-full gradient-pink transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        {step === 0 && (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Username (optional)</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@ellea"
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Pick a vibe</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className={`w-12 h-12 rounded-2xl text-2xl transition ${avatar === a ? "gradient-pink soft-shadow scale-110" : "bg-white/70 hover:bg-white"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Age</label>
              <input type="number" min={13} max={110} value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Gender</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["Female", "Male", "Non-binary", "Other", "Prefer not to say"].map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${gender === g ? "gradient-pink text-white soft-shadow" : "bg-white/70 hover:bg-white"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Hobbies you love</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map((h) => (
                  <button key={h} onClick={() => setHobbies(toggle(hobbies, h))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${hobbies.includes(h) ? "gradient-lavender text-white soft-shadow" : "bg-white/70 hover:bg-white"}`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Sports &amp; activities you do</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_OPTIONS.map((h) => (
                  <button key={h} onClick={() => setActivities(toggle(activities, h))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activities.includes(h) ? "gradient-mint soft-shadow" : "bg-white/70 hover:bg-white"}`}>
                    {h}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-xs font-semibold text-muted-foreground">Anything else you do</label>
              <textarea value={otherActivities} onChange={(e) => setOtherActivities(e.target.value)} rows={2}
                placeholder="e.g. horse riding, choir, robotics club, babysitting..."
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
              <p className="text-[11px] text-muted-foreground mt-1">Separate a few with commas 💗</p>
            </div>

          </>
        )}

        {step === 3 && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tell us about your day</label>
            <textarea value={routine} onChange={(e) => setRoutine(e.target.value)}
              placeholder="e.g. I'm a student, morning classes, work at a cafe, love winding down with journaling..."
              rows={5}
              className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
            <p className="text-xs text-muted-foreground mt-2">This helps your AI coach give tips that actually fit your life.</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 rounded-2xl py-3 font-semibold bg-white/70 border border-white">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext}
              className="flex-1 rounded-2xl py-3 font-semibold gradient-pink soft-shadow disabled:opacity-50">
              Continue
            </button>
          ) : (
            <button onClick={finish} disabled={saving}
              className="flex-1 rounded-2xl py-3 font-semibold gradient-pink soft-shadow disabled:opacity-50">
              {saving ? "Saving..." : "Finish 🌸"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
