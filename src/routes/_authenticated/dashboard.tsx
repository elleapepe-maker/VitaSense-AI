import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Droplet, Moon, Activity, Quote, Pencil, Footprints, Utensils, Smile, Flame as FlameIcon, Trophy, Bed, Dumbbell, Beef, Zap, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { SmartNudges, buildNudges } from "@/components/SmartNudges";
import { CommunityReviews } from "@/components/CommunityReviews";
import { CounselorNudge } from "@/components/CounselorNudge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Checkin = {
  water_glasses: number;
  sleep_hours: number;
  exercise_minutes: number;
  meals: number;
  mood_score: number;
  screen_hours: number;
};



type Profile = {
  display_name: string | null;
  avatar_emoji: string | null;
  onboarded: boolean;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Hey";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Hey";
}

const QUOTES: { text: string; author: string }[] = [
  { text: "You don't have to be positive all the time. It's okay to feel sad, angry, tired, or scared.", author: "Lori Deschene" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Rest is not a reward for hard work — it's a requirement for a healthy life.", author: "Unknown" },
  { text: "Take a deep breath. It's just a bad day, not a bad life.", author: "Unknown" },
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Little by little, day by day, what is meant for you will find its way.", author: "Unknown" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "You are enough, just as you are, right now.", author: "Meghan Markle" },
  { text: "Nothing can dim the light that shines from within.", author: "Maya Angelou" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
  { text: "The greatest wealth is health.", author: "Virgil" },
];

function todaysQuote() {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return QUOTES[seed % QUOTES.length];
}

function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const masc = theme === "masculine";
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [moodStats, setMoodStats] = useState<{ counts: Record<string, number>; streak: number; lastMood: string | null } | null>(null);
  const quote = todaysQuote();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("display_name, avatar_emoji, onboarded").eq("id", u.user.id).maybeSingle();
      if (!data || !data.onboarded) return navigate({ to: "/onboarding" });
      setProfile(data);
      const today = new Date().toISOString().slice(0, 10);
      const { data: c } = await supabase
        .from("daily_checkins")
        .select("water_glasses, sleep_hours, exercise_minutes, meals, mood_score, screen_hours")
        .eq("user_id", u.user.id)
        .eq("day", today)
        .maybeSingle();
      if (c) setCheckin({ ...c, sleep_hours: Number(c.sleep_hours), screen_hours: Number(c.screen_hours) });

      const { data: moods } = await supabase
        .from("mood_checkins")
        .select("mood, created_at")
        .eq("user_id", u.user.id)
        .eq("kind", "mood")
        .not("mood", "is", null)
        .order("created_at", { ascending: false })
        .limit(1000);
      const counts: Record<string, number> = { Great: 0, Good: 0, Meh: 0, Low: 0, Overwhelmed: 0 };
      // Use the LATEST mood per local day so each day only counts once.
      const perDay = new Map<string, string>();
      (moods ?? []).forEach((m) => {
        if (!m.mood) return;
        const d = new Date(m.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        // moods are ordered desc, so the first entry we see for a day is the most recent
        if (!perDay.has(key)) perDay.set(key, m.mood);
      });
      // Only count moods from the current week (Mon–Sun); resets every Monday.
      const nowW = new Date();
      const dow = (nowW.getDay() + 6) % 7; // 0 = Monday
      const weekStart = new Date(nowW.getFullYear(), nowW.getMonth(), nowW.getDate() - dow);
      perDay.forEach((mood, key) => {
        const [y, mo, da] = key.split("-").map(Number);
        const dd = new Date(y, mo - 1, da);
        if (dd >= weekStart) counts[mood] = (counts[mood] ?? 0) + 1;
      });
      // Great streak: consecutive days ending today (or yesterday) with mood === "Great"
      let streak = 0;
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      for (let i = 0; i < 365; i++) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (perDay.get(key) === "Great") streak++;
        else if (i === 0) continue; // allow no check-in today
        else break;
      }
      // Only surface a mood-aware nudge if the user actually checked in TODAY
      const lastMood = perDay.get(todayKey) ?? null;
      setMoodStats({ counts, streak, lastMood });
    })();
  }, [navigate]);

  if (!profile) return <div className="pt-10 text-center text-muted-foreground animate-pulse">Loading your space...</div>;

  const name = profile.display_name || "friend";

  const healthScore = (() => {
    if (!checkin) return null;
    const water = Math.min(1, checkin.water_glasses / 8);
    const sleep = 1 - Math.min(1, Math.abs(checkin.sleep_hours - 8) / 5);
    const exercise = Math.min(1, checkin.exercise_minutes / 30);
    const meals = Math.min(1, checkin.meals / 3);
    const mood = (checkin.mood_score - 1) / 9;
    const screen = 1 - Math.min(1, Math.max(0, checkin.screen_hours - 4) / 8);
    const raw = (water * 20 + sleep * 25 + exercise * 20 + meals * 10 + mood * 15 + screen * 10);
    return Math.max(20, Math.min(100, Math.round(raw)));
  })();

  return (
    <div className="pt-4 space-y-5">
      <div>
        <div className="text-sm text-muted-foreground">{greeting()},</div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-4xl font-bold">{name}</h1>
          <span className="text-3xl">{profile.avatar_emoji || "🌸"}</span>
        </div>
      </div>

      {/* Score */}
      <Link to="/schedule" className="block glass-card p-6 relative overflow-hidden hover:scale-[1.005] transition">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full gradient-pink opacity-30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {masc ? <Trophy className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />} Daily health score
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Pencil className="w-3 h-3" /> Edit schedule
            </div>
          </div>
          {healthScore === null ? (
            <>
              <div className="font-display text-3xl font-bold mt-2">Log today to see your score</div>
              <p className="text-sm text-muted-foreground mt-1">Tap here to fill in water, sleep, movement, meals and more — your score updates instantly.</p>
            </>
          ) : (
            <>
              <div className="flex items-end gap-2 mt-1">
                <div className="font-display text-6xl font-bold text-gradient-pink">{healthScore}</div>
                <div className="text-muted-foreground pb-2">/ 100</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {healthScore > 85 ? "You're glowing today 💗" : healthScore > 70 ? "Steady and calm — nice work." : "A gentle day ahead. Be kind to yourself."}
              </p>
            </>
          )}
        </div>
      </Link>

      {/* Smart nudges (contextual, opt-in browser notifications) */}
      <SmartNudges nudges={buildNudges({
        hasCheckin: !!checkin,
        water: checkin?.water_glasses ?? 0,
        exercise: checkin?.exercise_minutes ?? 0,
        sleep: checkin?.sleep_hours ?? 0,
        moodScore: checkin?.mood_score ?? 10,
        ritualsDoneToday: 0,
        hasWeeklyReport: false,
        lastMood: moodStats?.lastMood ?? null,
      })} />

      {/* Daily inspirational quote */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full gradient-lavender opacity-30 blur-3xl" />
        <div className="relative flex gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-lavender flex items-center justify-center soft-shadow shrink-0">
            <Quote className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Today's little reminder</div>
            <p className="font-display text-base leading-snug">"{quote.text}"</p>
            <div className="text-xs text-muted-foreground mt-1">— {quote.author}</div>
          </div>
        </div>
      </div>

      {/* Streak + mood tracker */}
      {moodStats && (
        <div className="grid grid-cols-1 gap-3">
          <Link to="/mood" className="glass-card p-5 flex items-center gap-4 hover:scale-[1.005] transition">
            <div className="w-14 h-14 rounded-2xl gradient-butter flex items-center justify-center soft-shadow">
              {masc ? <Trophy className="w-7 h-7 text-white" /> : <FlameIcon className="w-7 h-7 text-white" />}
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Great-day streak</div>
              <div className="font-display text-3xl font-bold text-gradient-pink">
                {moodStats.streak} <span className="text-base font-sans text-muted-foreground">{moodStats.streak === 1 ? "day" : "days"} in a row 🌈</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {moodStats.streak === 0 ? "Log a 'Great' mood in the Mood tab to start your streak." : "Keep it going — check in today too."}
              </div>
            </div>
          </Link>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Mood tracker (this week · resets Monday)</div>
            <div className="grid grid-cols-5 gap-2">
              {([
                { key: "Great", emoji: "🌈", tint: "gradient-pink" },
                { key: "Good", emoji: "🌸", tint: "gradient-mint" },
                { key: "Meh", emoji: "☁️", tint: "gradient-butter" },
                { key: "Low", emoji: "🌧️", tint: "gradient-lavender" },
                { key: "Overwhelmed", emoji: "🌪️", tint: "gradient-pink" },
              ] as const).map((m) => (
                <div key={m.key} className={`rounded-2xl p-3 text-center ${m.tint}`}>
                  <div className="text-xl">{m.emoji}</div>
                  <div className="font-display text-2xl font-bold">{moodStats.counts[m.key] ?? 0}</div>
                  <div className="text-[10px] font-semibold opacity-80">{m.key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}







      {/* Today's schedule */}
      {checkin ? (
        <div className="grid grid-cols-2 gap-3">
          <VitalCard icon={Droplet} label="Water" value={`${checkin.water_glasses}`} unit="glasses" tint="gradient-mint" />
          <VitalCard icon={masc ? Bed : Moon} label="Sleep" value={checkin.sleep_hours.toFixed(1)} unit="hrs" tint="gradient-lavender" />
          <VitalCard icon={masc ? Dumbbell : Footprints} label="Movement" value={`${checkin.exercise_minutes}`} unit="min" tint="gradient-pink" />
          <VitalCard icon={masc ? Beef : Utensils} label="Meals" value={`${checkin.meals}`} unit="today" tint="gradient-butter" />
          <VitalCard icon={masc ? Zap : Smile} label="Mood" value={`${checkin.mood_score}`} unit="/10" tint="gradient-pink" />
          <VitalCard icon={Activity} label="Screen time" value={checkin.screen_hours.toFixed(1)} unit="hrs" tint="gradient-lavender" />
        </div>
      ) : (
        <Link to="/schedule" className="glass-card p-6 flex items-center gap-4 hover:scale-[1.01] transition">
          <div className="w-14 h-14 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <Pencil className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-lg">Log today's schedule</div>
            <div className="text-sm text-muted-foreground">Water, sleep, movement and more — updates your score.</div>
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/symptoms" className="glass-card p-5 hover:scale-[1.01] transition">
          <div className="text-2xl mb-2">🩺</div>
          <div className="font-display font-bold">Not feeling great?</div>
          <div className="text-xs text-muted-foreground mt-1">Talk to the symptom assistant</div>
        </Link>
        <Link to="/mood" className="glass-card p-5 hover:scale-[1.01] transition">
          <div className="text-2xl mb-2">💭</div>
          <div className="font-display font-bold">Mood check-in</div>
          <div className="text-xs text-muted-foreground mt-1">Quick anxiety & mood quizzes</div>
        </Link>
        <Link to="/rituals" className="glass-card p-5 hover:scale-[1.01] transition">
          <div className="text-2xl mb-2">🌿</div>
          <div className="font-display font-bold">Today's ritual</div>
          <div className="text-xs text-muted-foreground mt-1">A tiny 2-min practice, just for you</div>
        </Link>
        <Link to="/weekly-glow" className="glass-card p-5 hover:scale-[1.01] transition">
          <div className="text-2xl mb-2">🪞</div>
          <div className="font-display font-bold">Weekly glow</div>
          <div className="text-xs text-muted-foreground mt-1">Your week, reflected by Haven💫</div>
        </Link>
        <Link to="/counselor" className="glass-card p-5 hover:scale-[1.01] transition">
          <div className="text-2xl mb-2">🤝</div>
          <div className="font-display font-bold">Counselor Connection</div>
          <div className="text-xs text-muted-foreground mt-1">A private 30-day report you can share</div>
        </Link>
        <Link to="/coach" className="glass-card p-5 hover:scale-[1.01] transition col-span-2">
          <div className="text-2xl mb-2"><Sparkles className="w-6 h-6 inline text-primary" /></div>
          <div className="font-display font-bold">Today's wellness tips</div>
          <div className="text-xs text-muted-foreground mt-1">Personalized ideas for water, sleep, and stretching</div>
        </Link>
      </div>

      <CounselorNudge />

      {/* Ratings & reviews */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Loved by many ⭐</h2>
          <span className="text-xs text-muted-foreground">Every rating & review</span>
        </div>
        <CommunityReviews compact />
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit, tint }: { icon: typeof Heart; label: string; value: string; unit: string; tint: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className={`w-8 h-8 rounded-xl ${tint} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 font-display text-3xl font-bold">
        {value}<span className="text-sm font-sans text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}
