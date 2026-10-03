import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, exportMyData } from "@/lib/account.functions";
import { Save, Trash2, ShieldCheck, Sparkles, Download, Star } from "lucide-react";
import { AppearancePanel } from "@/components/AppearancePanel";
import { PrivacyVault } from "@/components/PrivacyVault";
import { HAVEN_PERSONALITIES, type HavenPersonality } from "@/lib/haven.functions";
import { requestThemeRefresh, useTheme, themeForGender } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});


const FEMININE_AVATARS = ["🌸", "🦋", "🌷", "☁️", "🍑", "🪷", "🌙", "⭐️", "💗", "🌈"];
const MASCULINE_AVATARS = ["🏎️", "⚡️", "🏀", "🎮", "🏋️", "🏈", "🛹", "🐺", "🦅", "🚀"];
const EXTRA_AVATARS = ["⚽️", "🎾", "🥭", "🍓", "❤️‍🔥", "🐦‍⬛"];
const HOBBY_OPTIONS = ["Reading", "Music", "Art", "Gaming", "Cooking", "Photography", "Journaling", "Baking"];
const ACTIVITY_OPTIONS = [
  "Walking", "Yoga", "Running", "Dance", "Cycling", "Pilates", "Swimming", "Weights",
  "Soccer", "Basketball", "Tennis", "Volleyball", "Track", "Football", "Softball", "Baseball",
  "Cheer", "Gymnastics", "Martial arts", "Skating", "Hiking", "Golf", "Wrestling", "Badminton",
];


const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Profile() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState("🌸");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [otherActivities, setOtherActivities] = useState("");

  const [routine, setRoutine] = useState("");
  const [personality, setPersonality] = useState<HavenPersonality>("gentle_guide");
  const doDelete = useServerFn(deleteMyAccount);
  const doExport = useServerFn(exportMyData);
  const [exporting, setExporting] = useState(false);

  // Live preview the theme as soon as the user picks a gender (before saving).
  const onGenderChange = (v: string) => {
    setGender(v);
    setTheme(themeForGender(v));
  };


  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (p) {
        setName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setAge(p.age ?? "");
        setGender(p.gender ?? "");
        setAvatar(p.avatar_emoji ?? "🌸");
        setHobbies((p.hobbies as string[] | null) ?? []);
        const saved = (p.activities as string[] | null) ?? [];
        setActivities(saved.filter((a) => ACTIVITY_OPTIONS.includes(a)));
        setOtherActivities(saved.filter((a) => !ACTIVITY_OPTIONS.includes(a)).join(", "));

        setRoutine(p.daily_routine ?? "");
        setPersonality(((p as unknown as { haven_personality?: HavenPersonality }).haven_personality) ?? "gentle_guide");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
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
      haven_personality: personality,
      onboarded: true,
      updated_at: new Date().toISOString(),
    } as unknown as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    requestThemeRefresh();
    toast.success("Profile updated 💗");
    navigate({ to: "/dashboard" });
  };


  if (loading) return <div className="pt-10 text-center text-muted-foreground animate-pulse">Loading your profile...</div>;

  return (
    <div className="pt-4 space-y-5 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">Update anything anytime — it helps Haven and your coach personalize things.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <Field label="Display name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
        </Field>
        <Field label="Username">
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" placeholder="@you" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} className="input" />
          </Field>
          <Field label="Gender">
            <select value={gender} onChange={(e) => onGenderChange(e.target.value)} className="input">
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">Female keeps the pink/flower theme, Male switches to a cool blue car theme, Non-binary turns the app purple, and Other turns it sunny yellow. 💗</p>
          </Field>


        </div>
        <Field label="Avatar">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Blossom</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {FEMININE_AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition ${avatar === a ? "gradient-pink soft-shadow scale-110" : "bg-white/70 hover:bg-white"}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">Bold</div>
          <div className="flex flex-wrap gap-2">
            {MASCULINE_AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition ${avatar === a ? "gradient-pink soft-shadow scale-110" : "bg-white/70 hover:bg-white"}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-muted-foreground mb-1 mt-3">Extras</div>
          <div className="flex flex-wrap gap-2">
            {EXTRA_AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition ${avatar === a ? "gradient-pink soft-shadow scale-110" : "bg-white/70 hover:bg-white"}`}>
                {a}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="glass-card p-5 space-y-3">
        <Field label="Hobbies">
          <ChipRow options={HOBBY_OPTIONS} selected={hobbies} onToggle={(v) => setHobbies(toggle(hobbies, v))} />
        </Field>
        <Field label="Sports & activities you do">
          <ChipRow options={ACTIVITY_OPTIONS} selected={activities} onToggle={(v) => setActivities(toggle(activities, v))} />
        </Field>
        <Field label="Anything else you do">
          <textarea value={otherActivities} onChange={(e) => setOtherActivities(e.target.value)} className="input min-h-[70px]"
            placeholder="e.g. horse riding, choir, robotics club, babysitting..." />
          <p className="text-[11px] text-muted-foreground mt-1">Separate a few with commas 💗</p>
        </Field>

        <Field label="Daily routine">
          <textarea value={routine} onChange={(e) => setRoutine(e.target.value)} className="input min-h-[80px]" placeholder="A little about how your day usually looks..." />
        </Field>
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <div className="text-sm font-semibold">Haven💫's personality</div>
        </div>
        <p className="text-xs text-muted-foreground">Choose the vibe that helps you most. You can change this anytime.</p>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(HAVEN_PERSONALITIES) as HavenPersonality[]).map((key) => {
            const p = HAVEN_PERSONALITIES[key];
            const active = personality === key;
            return (
              <button key={key} onClick={() => setPersonality(key)} type="button"
                className={`text-left rounded-2xl p-3 border transition ${active ? "gradient-pink text-white soft-shadow border-transparent" : "bg-white/70 border-white hover:bg-white"}`}>
                <div className="font-display font-bold">{p.label}</div>
                <div className={`text-xs ${active ? "text-white/90" : "text-muted-foreground"}`}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={save} disabled={saving || !name}
        className="w-full rounded-2xl gradient-pink text-white font-semibold py-4 soft-shadow disabled:opacity-60 flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save changes"}
      </button>

      <Link to="/memories" className="glass-card p-5 flex items-center gap-3 hover:scale-[1.005] transition">
        <div className="w-11 h-11 rounded-2xl gradient-pink flex items-center justify-center soft-shadow shrink-0">
          <Star className="w-5 h-5 text-white" fill="white" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold">What Haven💫 remembers</div>
          <div className="text-xs text-muted-foreground">See every little thing she's saved — and remove anything you want.</div>
        </div>
      </Link>

      <AppearancePanel />

      <PrivacyVault />

      <div className="glass-card p-5 space-y-3 border border-destructive/30">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <div className="text-sm font-semibold">Privacy</div>
        </div>
        <button
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              const data = await doExport();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `vitasense-my-data-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Your data is downloading 💗");
            } catch {
              toast.error("Couldn't build your download just yet.");
            } finally {
              setExporting(false);
            }
          }}
          className="w-full rounded-2xl bg-white/70 border border-white font-semibold py-3 flex items-center justify-center gap-2 hover:bg-white transition disabled:opacity-60"
        >
          <Download className="w-4 h-4" /> {exporting ? "Preparing…" : "Download my data"}
        </button>
        <p className="text-xs text-muted-foreground">Your journal entries, chats, and check-ins stay private to your account. You can delete everything at any time.</p>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full rounded-2xl border border-destructive/40 text-destructive font-semibold py-3 flex items-center justify-center gap-2 hover:bg-destructive/5">
            <Trash2 className="w-4 h-4" /> Delete my account
          </button>
        ) : (
          <div className="rounded-2xl bg-destructive/5 border border-destructive/30 p-4 space-y-3">
            <div className="text-sm font-semibold text-destructive">This will permanently delete your account and every check-in, chat, and entry. This cannot be undone.</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                className="rounded-2xl py-2 text-sm font-semibold bg-white/70 border border-white">
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await doDelete();
                    await supabase.auth.signOut();
                    toast.success("Your account has been deleted. Take care 💗");
                    navigate({ to: "/", replace: true });
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Couldn't delete account");
                    setDeleting(false);
                  }
                }}
                className="rounded-2xl py-2 text-sm font-semibold bg-destructive text-destructive-foreground soft-shadow disabled:opacity-60">
                {deleting ? "Deleting..." : "Yes, delete forever"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`.input{width:100%;border-radius:1rem;background:rgba(255,255,255,0.8);border:1px solid white;padding:0.75rem 1rem;outline:none;font-size:0.875rem}.input:focus{box-shadow:0 0 0 2px hsl(var(--primary) / 0.4)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</div>
      {children}
    </div>
  );
}

function ChipRow({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onToggle(o)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selected.includes(o) ? "gradient-pink text-white soft-shadow" : "bg-white/70 hover:bg-white"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}
