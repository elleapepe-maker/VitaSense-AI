import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import slideAsset from "@/assets/About_Me_Ellea_Pepe.pptx.asset.json";
import slideImage from "@/assets/About_Me_Ellea_Pepe.jpg.asset.json";


import {
  Activity,
  Award,
  Bed,
  Bell,
  Brain,
  Calendar,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Dumbbell,
  EyeOff,
  Flame,
  Flower2,
  Footprints,
  Heart,
  MessageCircle,
  Mic,
  Moon,
  Palette,
  Pencil,
  Presentation,
  Quote,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smile,
  Star,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";


import { MoodBloom } from "@/components/MoodBloom";
import { MoodCar } from "@/components/MoodCar";
import { MoodFlower } from "@/components/MoodFlower";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "VitaSense AI — Interactive Demo" },
      { name: "description", content: "A realistic guided tour of the VitaSense AI app screens: Home, Schedule, Mood, Haven, Journey, Rituals, Weekly Glow, Friends, Symptoms, and Profile." },
      { property: "og:title", content: "VitaSense AI — Interactive Demo" },
      { property: "og:description", content: "Walk through the real VitaSense AI experience with sample data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

type Step = {
  nav: "Home" | "Mood" | "Haven💫" | "Journey" | "Friends" | "Profile";
  title: string;
  caption: string;
  render: () => React.ReactElement;
};

const NameCtx = createContext("Ellea");
const useDemoName = () => useContext(NameCtx);

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Hey";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Hey";
}

function DemoPage() {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("Ellea");
  const [signedIn, setSignedIn] = useState(false);
  const [slideOpen, setSlideOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      setSignedIn(true);
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string };
      const displayName = profile?.display_name?.trim() || meta.display_name?.trim() || meta.name?.trim() || user.email?.split("@")[0] || "Ellea";
      setName(displayName.split(" ")[0]);
    })();
  }, []);

  const steps: Step[] = [
    {
      nav: "Home",
      title: "Home dashboard",
      caption: "This is the actual home flow: time-of-day greeting, daily health score, smart nudges, quote, streak, mood tracker, schedule card, and quick actions.",
      render: () => <DashboardScreen />,
    },
    {
      nav: "Home",
      title: "Today's schedule",
      caption: "The score is based on what the user logs each day: water, sleep, movement, meals, mood, screen time, and notes.",
      render: () => <ScheduleScreen />,
    },
    {
      nav: "Mood",
      title: "Mood + anxiety check-ins",
      caption: "The Mood tab has two parts: Mood and Anxiety. It saves the check-in, gives a gentle plan, and lets the user keep talking after.",
      render: () => <MoodScreen />,
    },
    {
      nav: "Haven💫",
      title: "Haven Chat",
      caption: "Haven is the separate judgement-free chat space for venting, voice notes, grounding exercises, memories, and personalization.",
      render: () => <HavenScreen />,
    },
    {
      nav: "Journey",
      title: "Journey + weekly garden",
      caption: "The Journey page shows the flower or sports car, the key, weekly garden/garage, achievements, mood distribution, and timeline.",
      render: () => <JourneyScreen />,
    },
    {
      nav: "Journey",
      title: "Daily Rituals",
      caption: "Rituals are tiny 2-minute practices matched to how the user feels, with a ritual streak and an all-rituals list.",
      render: () => <RitualsScreen />,
    },
    {
      nav: "Journey",
      title: "Weekly Glow Report",
      caption: "Weekly Glow is Haven's reflection of the user's moods, notes, patterns, what helped, and shareable progress.",
      render: () => <WeeklyGlowScreen />,
    },
    {
      nav: "Friends",
      title: "Friends + shared streaks",
      caption: "Friends can search names, send requests, accept/decline, and keep shared wellness streaks where boxes fill only when both people complete the task.",
      render: () => <FriendsScreen />,
    },
    {
      nav: "Home",
      title: "Symptom check",
      caption: "The symptom assistant asks questions, gives safety guidance, and flags serious symptoms without pretending to be a doctor.",
      render: () => <SymptomsScreen />,
    },
    {
      nav: "Profile",
      title: "Profile + themes",
      caption: "Profile controls display name, username, gender-based theme, avatar, hobbies, daily routine, Haven personality, privacy, and account deletion.",
      render: () => <ProfileScreen />,
    },
  ];

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <NameCtx.Provider value={name}>
      <div className="min-h-screen">
        <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl">VitaSense AI</span>
          </Link>
          <Link to="/" className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition" aria-label="Exit demo">
            <X className="w-4 h-4" />
          </Link>
        </header>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary border border-white mb-4">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> {signedIn ? `Interactive demo · hi ${name} 💗` : "Interactive demo · sample app screens"}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">{step.title}</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{step.caption}</p>
            <button
              type="button"
              onClick={() => setSlideOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-white/80 border border-white backdrop-blur hover:bg-white transition"
            >
              <Presentation className="w-4 h-4 text-primary" /> About Me slide
            </button>
          </div>

          {slideOpen && (
            <div
              onClick={() => setSlideOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setSlideOpen(false)}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-10 rounded-full bg-white/90 hover:bg-white w-9 h-9 flex items-center justify-center text-lg font-bold shadow"
                >
                  ×
                </button>
                <img src={slideImage.url} alt="About Ellea Pepe" className="w-full h-auto block" />
                <div className="flex justify-end gap-2 p-3 bg-white border-t">
                  <a
                    href={slideAsset.url}
                    download="About_Me_Ellea_Pepe.pptx"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition"
                  >
                    <Presentation className="w-4 h-4" /> Download .pptx
                  </a>
                </div>
              </div>
            </div>
          )}


          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {steps.map((s, idx) => (
              <button
                key={`${s.title}-${idx}`}
                onClick={() => setIndex(idx)}
                aria-label={`Go to ${s.title}`}
                className={`h-2 rounded-full transition-all ${idx === index ? "w-8 gradient-pink" : "w-2 bg-white/70 border border-white"}`}
              />
            ))}
          </div>

          <div className="mx-auto max-w-sm">
            <div className="rounded-[2.5rem] border-[10px] border-foreground/90 bg-background soft-shadow overflow-hidden">
              <div className="h-6 bg-foreground/90 flex items-center justify-center">
                <div className="w-16 h-1.5 rounded-full bg-white/30" />
              </div>
              <div className="relative h-[680px] overflow-hidden p-4 pb-0">
                <DemoHeader active={step.nav} />
                <div className="h-[570px] overflow-y-auto pr-1 pb-20">{step.render()}</div>
                <DemoNav active={step.nav} />
              </div>
            </div>
          </div>

          <div className="max-w-sm mx-auto mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setIndex((v) => Math.max(0, v - 1))}
              disabled={index === 0}
              className="rounded-full px-5 py-3 font-semibold bg-white/80 border border-white backdrop-blur inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {isLast ? (
              <Link to={signedIn ? "/dashboard" : "/auth"} className="rounded-full gradient-pink px-6 py-3 font-semibold soft-shadow hover:scale-105 transition inline-flex items-center gap-1">
                {signedIn ? "Open my app" : "Create your account"} <Heart className="w-4 h-4" fill="white" />
              </Link>
            ) : (
              <button
                onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))}
                className="rounded-full gradient-pink px-6 py-3 font-semibold soft-shadow hover:scale-105 transition inline-flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-center mt-4 text-xs text-muted-foreground">
            Step {index + 1} of {steps.length} · Preview using sample data
          </div>

          <CopyPitchScript name={name} />
        </section>
      </div>
    </NameCtx.Provider>
  );
}

function DemoHeader({ active }: { active: Step["nav"] }) {
  const Icon = active === "Haven💫" ? Star : active === "Journey" ? Flower2 : active === "Friends" ? Users : active === "Profile" ? User : Heart;
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg gradient-pink flex items-center justify-center soft-shadow">
          <Icon className="w-3 h-3 text-white" fill={active === "Home" || active === "Haven💫" ? "white" : "none"} />
        </div>
        <span className="font-display font-bold text-xs">VitaSense AI</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-white/70 border border-white flex items-center justify-center">
          <User className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

function DemoNav({ active }: { active: Step["nav"] }) {
  const tabs = [
    { label: "Home", icon: Heart },
    { label: "Haven", icon: Star },
    { label: "Mood", icon: Smile },
    { label: "Journey", icon: Flower2 },
    { label: "Friends", icon: Users },
  ] as const;
  return (
    <div className="absolute bottom-3 left-4 right-4 glass-card px-1.5 py-1.5 flex items-center justify-between text-[9px]">
      {tabs.map((tab) => {
        const selected = active === tab.label || (active === "Haven💫" && tab.label === "Haven") || (active === "Profile" && tab.label === "Home");
        return (
          <div key={tab.label} className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${selected ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>
            <tab.icon className="w-3.5 h-3.5" fill={tab.label === "Home" || tab.label === "Haven" ? "currentColor" : "none"} />
            <span className="font-semibold">{tab.label === "Haven" ? "Haven Chat" : tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card p-3 ${className}`}>{children}</div>;
}

function DashboardScreen() {
  const name = useDemoName();
  const moods = [
    { key: "Great", emoji: "🌈", tint: "gradient-pink", count: 0 },
    { key: "Good", emoji: "🌸", tint: "gradient-mint", count: 0 },
    { key: "Meh", emoji: "☁️", tint: "gradient-butter", count: 1 },
    { key: "Low", emoji: "🌧️", tint: "gradient-lavender", count: 0 },
    { key: "Overwhelmed", emoji: "🌪️", tint: "gradient-pink", count: 0 },
  ];
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted-foreground">{greeting()},</div>
        <div className="flex items-center gap-1.5">
          <h2 className="font-display text-2xl font-bold">{name}</h2>
          <span className="text-xl">🌸</span>
        </div>
      </div>

      <MiniSection className="relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full gradient-pink opacity-30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"><Heart className="w-3 h-3" /> Daily health score</div>
            <div className="flex items-center gap-1 text-[10px] text-primary font-semibold"><Pencil className="w-2.5 h-2.5" /> Edit schedule</div>
          </div>
          <div className="font-display text-lg font-bold mt-1">Log today to see your score</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tap here to fill in water, sleep, movement, meals and more — your score updates instantly.</p>
        </div>
      </MiniSection>

      <MiniSection>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Smart nudges</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-primary"><Bell className="w-2.5 h-2.5" /> Enable reminders</div>
        </div>
        <div className="space-y-1.5">
          <Nudge emoji="💧" text="A glass of water sounds lovely right now." />
          <Nudge emoji="✨" text="Two minutes for a tiny ritual? It'll shift the day." />
        </div>
      </MiniSection>

      <MiniSection className="relative overflow-hidden">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-xl gradient-lavender flex items-center justify-center soft-shadow shrink-0"><Quote className="w-3.5 h-3.5 text-white" /></div>
          <div>
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Today's little reminder</div>
            <p className="font-display text-[12px] leading-snug">"Rest is not a reward for hard work — it's a requirement for a healthy life."</p>
            <div className="text-[10px] text-muted-foreground mt-0.5">— Unknown</div>
          </div>
        </div>
      </MiniSection>

      <MiniSection className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-butter flex items-center justify-center soft-shadow"><Flame className="w-5 h-5 text-white" /></div>
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Great-day streak</div>
          <div className="font-display text-xl font-bold text-gradient-pink">0 <span className="text-[11px] font-sans text-muted-foreground">days in a row 🌈</span></div>
          <div className="text-[10px] text-muted-foreground">Log a 'Great' mood in the Mood tab to start your streak.</div>
        </div>
      </MiniSection>

      <MiniSection>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mood tracker (this week · resets Monday)</div>
        <div className="grid grid-cols-5 gap-1.5">
          {moods.map((m) => (
            <div key={m.key} className={`rounded-xl p-1.5 text-center ${m.tint}`}>
              <div className="text-sm">{m.emoji}</div>
              <div className="font-display text-base font-bold leading-none">{m.count}</div>
              <div className="text-[8px] font-semibold opacity-80 mt-0.5">{m.key}</div>
            </div>
          ))}
        </div>
      </MiniSection>

      <MiniSection className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center soft-shadow"><Pencil className="w-5 h-5 text-white" /></div>
        <div>
          <div className="font-display font-bold text-sm">Log today's schedule</div>
          <div className="text-[11px] text-muted-foreground">Water, sleep, movement and more — updates your score.</div>
        </div>
      </MiniSection>

      <div className="grid grid-cols-2 gap-2">
        <QuickAction emoji="🩺" title="Not feeling great?" detail="Talk to the symptom assistant" />
        <QuickAction emoji="💭" title="Mood check-in" detail="Quick anxiety & mood quizzes" />
        <QuickAction emoji="🌿" title="Today's ritual" detail="A tiny 2-min practice" />
        <QuickAction emoji="🪞" title="Weekly glow" detail="Your week, reflected" />
        <QuickAction emoji="✨" title="Today's wellness tips" detail="Gentle ideas for your day" />
      </div>
    </div>
  );
}

function Nudge({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2 border border-white">
      <div className="text-base">{emoji}</div>
      <div className="text-[11px] flex-1">{text}</div>
    </div>
  );
}

function QuickAction({ emoji, title, detail }: { emoji: string; title: string; detail: string }) {
  return (
    <MiniSection>
      <div className="text-lg mb-1">{emoji}</div>
      <div className="font-display font-bold text-[12px] leading-tight">{title}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{detail}</div>
    </MiniSection>
  );
}

function ScheduleScreen() {
  const sliders = [
    { icon: Droplet, label: "Water", value: "6", unit: "glasses", tint: "gradient-mint" },
    { icon: Moon, label: "Sleep last night", value: "7", unit: "hrs", tint: "gradient-lavender" },
    { icon: Footprints, label: "Exercise / movement", value: "20", unit: "min", tint: "gradient-pink" },
    { icon: Heart, label: "Meals", value: "3", unit: "meals", tint: "gradient-butter" },
    { icon: Smile, label: "How you feel", value: "7", unit: "/ 10", tint: "gradient-pink" },
    { icon: Brain, label: "Screen time", value: "4", unit: "hrs", tint: "gradient-lavender" },
  ];
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-bold">Today's schedule</h2>
        <p className="text-xs text-muted-foreground">Edit this each day — your health score reflects what you log here.</p>
      </div>
      <MiniSection>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">How to log your day 💗</div>
        <ol className="text-[11px] space-y-1 list-decimal list-inside text-foreground/80 mt-2">
          <li>Slide each bar to match what you actually did today.</li>
          <li>Water: count glasses, aim for around 8.</li>
          <li>Movement: walks, stretching, workouts all count.</li>
          <li>Save today. Come back and update anytime.</li>
        </ol>
      </MiniSection>
      {sliders.map((s) => (
        <MiniSlider key={s.label} {...s} />
      ))}
      <MiniSection>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Notes (optional)</div>
        <div className="w-full rounded-2xl bg-white/80 border border-white p-3 text-xs text-muted-foreground min-h-[56px]">Anything you want to remember about today...</div>
      </MiniSection>
      <button className="w-full rounded-2xl gradient-pink text-white font-semibold py-3 soft-shadow flex items-center justify-center gap-2 text-sm"><Save className="w-4 h-4" /> Save today</button>
    </div>
  );
}

function MiniSlider({ icon: Icon, label, value, unit, tint }: { icon: typeof Heart; label: string; value: string; unit: string; tint: string }) {
  return (
    <MiniSection>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-xl ${tint} flex items-center justify-center`}><Icon className="w-4 h-4" /></div><div className="font-semibold text-xs">{label}</div></div>
        <div className="font-display text-lg font-bold">{value}<span className="text-[10px] font-sans text-muted-foreground ml-1">{unit}</span></div>
      </div>
      <div className="h-2 rounded-full bg-white/80 overflow-hidden"><div className="h-full gradient-pink rounded-full" style={{ width: "62%" }} /></div>
    </MiniSection>
  );
}

function MoodScreen() {
  const [tab, setTab] = useState<"mood" | "anxiety">("mood");
  const moods = [
    { emoji: "🌈", label: "Great" },
    { emoji: "🌸", label: "Good" },
    { emoji: "☁️", label: "Meh" },
    { emoji: "🌧️", label: "Low" },
    { emoji: "🌪️", label: "Overwhelmed" },
  ];
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-bold">Check in with yourself</h2>
        <p className="text-xs text-muted-foreground">Little pauses make a big difference. Your entries stay private 🔒</p>
      </div>
      <div className="glass-card p-1 flex">
        <button onClick={() => setTab("mood")} className={`flex-1 rounded-2xl py-2 text-xs font-semibold transition ${tab === "mood" ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>💭 Mood</button>
        <button onClick={() => setTab("anxiety")} className={`flex-1 rounded-2xl py-2 text-xs font-semibold transition ${tab === "anxiety" ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>🌊 Anxiety</button>
      </div>
      {tab === "mood" ? (
        <div className="space-y-3">
          <MiniSection>
            <div className="text-[10px] font-semibold text-muted-foreground mb-2">How are you feeling?</div>
            <div className="grid grid-cols-5 gap-1.5">
              {moods.map((m) => (
                <button key={m.label} className={`rounded-2xl py-2 flex flex-col items-center gap-0.5 transition ${m.label === "Meh" ? "gradient-pink text-white soft-shadow" : "bg-white/70"}`}>
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[8px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[10px] font-semibold text-muted-foreground mb-1">Anything else on your mind? (optional)</div>
            <div className="rounded-2xl border border-border bg-white/80 px-3 py-2 text-[11px] text-muted-foreground">A quick brain dump...</div>
            <button className="mt-3 w-full rounded-2xl py-2 text-xs font-semibold gradient-pink soft-shadow">Get today's tips ✨</button>
          </MiniSection>
          <MoodPlan />
        </div>
      ) : (
        <AnxietyPanel />
      )}
      <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" /> Tips here are supportive, not medical advice.</div>
    </div>
  );
}

function MoodPlan() {
  return (
    <div className="space-y-3">
      <MiniSection>
        <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-xl gradient-lavender flex items-center justify-center"><Star className="w-3.5 h-3.5 text-white" fill="white" /></div><div className="font-display font-bold text-sm">Your gentle plan</div></div>
        <div className="text-xs whitespace-pre-line leading-relaxed">Since today feels meh, keep it simple: drink water, take a two-minute stretch break, and pick one tiny task you can finish.</div>
      </MiniSection>
      <MiniSection className="space-y-2">
        <div>
          <div className="font-display font-bold text-sm leading-tight">Keep talking 💗</div>
          <div className="text-[10px] text-muted-foreground">I'm here whenever you need — you're not alone.</div>
        </div>
        <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs gradient-pink text-white soft-shadow">My brain feels tired today.</div></div>
        <div className="bg-white/80 border border-white rounded-2xl px-3 py-2 text-xs">That makes sense. We can make this smaller — what feels hardest right now?</div>
        <div className="glass-card p-2 flex gap-2"><div className="flex-1 text-xs text-muted-foreground px-2 py-1">Type a message...</div><button className="rounded-xl px-3 gradient-pink"><Send className="w-3 h-3 text-white" /></button></div>
      </MiniSection>
    </div>
  );
}

function AnxietyPanel() {
  const questions = [
    "How often have you felt nervous or on edge lately?",
    "How often have you been unable to stop worrying?",
    "How often have you felt restless or hard to sit still?",
    "How often have you had trouble relaxing?",
    "How often have you felt afraid something bad might happen?",
  ];
  return (
    <MiniSection className="space-y-3">
      <div className="text-xs text-muted-foreground">Over the last 2 weeks...</div>
      {questions.map((q, idx) => (
        <div key={q}>
          <div className="text-xs font-semibold mb-2">{q}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {["Not at all", "A few days", "More than half", "Nearly every day"].map((option, optionIdx) => (
              <button key={option} className={`rounded-2xl px-2 py-1.5 text-[10px] font-semibold transition ${optionIdx === idx + 1 ? "gradient-lavender text-white soft-shadow" : "bg-white/70"}`}>{option}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-2xl bg-white/70 p-3 text-center"><div className="text-[10px] text-muted-foreground">Your anxiety level right now</div><div className="font-display text-3xl font-bold text-gradient-pink mt-0.5">5<span className="text-sm text-muted-foreground">/10</span></div></div>
      <button className="w-full rounded-2xl py-2 text-xs font-semibold gradient-pink soft-shadow">Get personalized tips ✨</button>
    </MiniSection>
  );
}

function HavenScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center soft-shadow"><Star className="w-5 h-5 text-white" fill="white" /></div>
          <div><h2 className="font-display text-2xl font-bold leading-tight">Haven Chat</h2><p className="text-[10px] text-muted-foreground">Your warm, judgement-free space to vent, chat, or get a gentle nudge.</p></div>
        </div>
        <div className="rounded-full bg-white/80 border border-white px-2 py-1 text-[9px] font-semibold text-primary flex items-center gap-1"><Settings2 className="w-2.5 h-2.5" /> Customize</div>
      </div>
      <MiniSection className="min-h-[335px] flex flex-col">
        <div className="flex-1 space-y-2">
          <div className="flex justify-start"><div className="max-w-[88%] rounded-2xl px-3 py-2 text-xs bg-white/80 border border-white">Hi friend, I'm Haven — your safe little corner. No judgement here, ever. What's going on in your world right now? 💗</div></div>
          <div className="grid grid-cols-2 gap-1.5">
            <Starter icon={Droplet} label="Hydration check" />
            <Starter icon={Footprints} label="Move me" />
            <Starter icon={MessageCircle} label="I need to vent" />
            <Starter icon={Moon} label="Wind-down tips" />
          </div>
          <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs gradient-pink text-white soft-shadow">I just want to vent for a minute.</div></div>
          <div className="flex justify-start"><div className="max-w-[88%] rounded-2xl px-3 py-2 text-xs bg-white/80 border border-white">I'm here. You don't have to make it sound perfect — just say what happened, and we can sort through it gently.</div></div>
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl bg-white/70 border border-white px-3 py-2 text-xs font-semibold text-primary"><Star className="w-3 h-3" /> Generate a grounding exercise</button>
        <div className="flex gap-2 mt-2"><div className="flex-1 rounded-2xl border border-border bg-white/80 px-3 py-2 text-xs text-muted-foreground">Say anything...</div><button className="rounded-2xl px-3 bg-white/80 border border-white"><Mic className="w-3.5 h-3.5 text-primary" /></button><button className="rounded-2xl px-3 gradient-pink"><Send className="w-3.5 h-3.5 text-white" /></button></div>
      </MiniSection>
      <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" /> Haven is a supportive companion, not a doctor. Your entries stay private.</div>
    </div>
  );
}

function Starter({ icon: Icon, label }: { icon: typeof Heart; label: string }) {
  return <button className="text-left flex items-center gap-1.5 rounded-2xl bg-white/70 border border-white px-2 py-1.5 text-[10px] font-semibold"><Icon className="w-3 h-3 text-primary" />{label}</button>;
}

function JourneyScreen() {
  const key = [
    { mood: "Great", desc: "All gold — you're glowing." },
    { mood: "Good", desc: "Gold petals with a soft pink center." },
    { mood: "Meh", desc: "Gold petals with pink tips." },
    { mood: "Low", desc: "Half pink petals, with gold still growing." },
    { mood: "Overwhelmed", desc: "Pink bloom with a gold stem — support is still there." },
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const moods = ["Great", "Good", "Meh", "Low", "Overwhelmed", null, null] as const;
  return (
    <div className="space-y-3">
      <div><h2 className="font-display text-2xl font-bold">Your journey 🌸</h2><p className="text-xs text-muted-foreground">A timeline of your progress and how you've been feeling.</p></div>
      <div className="grid grid-cols-2 gap-2"><QuickAction emoji="🌿" title="Today's ritual" detail="Tiny 2-min practice" /><QuickAction emoji="🪞" title="Weekly glow" detail="Your week, reflected" /></div>
      <MiniSection className="flex flex-col items-center text-center"><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Today's flower</div><MoodFlower mood="Meh" size={112} /><div className="font-display text-lg font-bold">Feeling Meh</div><div className="text-[10px] text-muted-foreground">Your flower changes with how you're feeling each day.</div></MiniSection>
      <MiniSection>
        <div className="font-display font-bold text-sm mb-1">Your flower key 🌼</div>
        <p className="text-[10px] text-muted-foreground mb-2">Here's what each bloom means — and how to grow into a fully gold flower.</p>
        <div className="space-y-1.5">
          {key.map((item) => <div key={item.mood} className="flex items-center gap-2 bg-white/60 rounded-2xl p-2 border border-white"><MoodFlower mood={item.mood as never} size={38} /><div><div className="font-semibold text-xs">{item.mood}</div><div className="text-[10px] text-muted-foreground">{item.desc}</div></div></div>)}
        </div>
        <div className="mt-2 rounded-2xl bg-white/70 border border-white p-2 text-[10px] text-muted-foreground"><strong className="text-foreground">Grow toward all-gold:</strong> log your mood, drink water, move gently, rest, and use Haven or a ritual when the day feels heavy.</div>
      </MiniSection>
      <MiniSection>
        <div className="font-display font-bold text-sm mb-1">Your weekly garden 🌷</div>
        <p className="text-[10px] text-muted-foreground mb-2">A little bloom for every day this week.</p>
        <div className="grid grid-cols-7 gap-1">{days.map((d, idx) => <div key={d} className="flex flex-col items-center"><MoodFlower mood={moods[idx] as never} size={34} /><div className="text-[9px] font-semibold mt-1">{d}</div></div>)}</div>
      </MiniSection>
      <MiniSection>
        <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-primary" /><div className="font-display font-bold text-sm">Achievements</div><span className="ml-auto text-[10px] text-muted-foreground">3/8</span></div>
        <div className="grid grid-cols-2 gap-1.5">{["First bloom", "3 great days", "Hydration hero", "Haven confidant"].map((b, i) => <div key={b} className={`rounded-2xl p-2 text-center border ${i < 2 ? "gradient-pink text-white border-white soft-shadow" : "bg-white/50 border-white text-muted-foreground opacity-70"}`}><div>{i < 2 ? "🌸" : "💧"}</div><div className="text-[10px] font-semibold">{b}</div></div>)}</div>
      </MiniSection>
      <div className="grid grid-cols-2 gap-2"><MiniSection><div className="text-[10px] text-muted-foreground uppercase font-semibold">Streak</div><div className="font-display text-xl font-bold text-gradient-pink">0 days</div></MiniSection><MiniSection><div className="text-[10px] text-muted-foreground uppercase font-semibold">Check-ins</div><div className="font-display text-xl font-bold text-gradient-pink">1</div></MiniSection></div>
      <MiniSection><div className="font-display font-bold text-sm mb-2">Mood distribution</div>{["Great", "Good", "Meh", "Low", "Overwhelmed"].map((m) => <div key={m} className="flex items-center gap-2 mb-1"><span className="w-20 text-[10px] font-semibold">{m}</span><div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden"><div className="h-full gradient-pink rounded-full" style={{ width: m === "Meh" ? "100%" : "0%" }} /></div><span className="text-[10px]">{m === "Meh" ? 1 : 0}</span></div>)}</MiniSection>
      <MiniSection><div className="font-display font-bold text-sm mb-2">Health score trend</div><div className="flex items-end gap-1 h-14">{[30, 45, 55, 42, 62, 50, 68].map((h, i) => <div key={i} className="flex-1 rounded-t-xl gradient-pink opacity-80" style={{ height: `${h}%` }} />)}</div></MiniSection>
      <MiniSection>
        <div className="flex items-center justify-between mb-2"><div className="font-display font-bold text-sm">Timeline</div><button className="flex items-center gap-1 text-[10px] font-semibold bg-white/70 border border-white rounded-full px-2 py-1"><EyeOff className="w-3 h-3" /> Blur responses</button></div>
        <ol className="relative border-l-2 border-primary/30 ml-2 space-y-3"><li className="pl-4 relative"><span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full gradient-pink border-2 border-white" /><div className="text-[10px] font-semibold text-muted-foreground">Today</div><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-white font-semibold">Meh</span><div className="text-xs mt-1 italic">"I felt tired but still showed up."</div></li></ol>
      </MiniSection>
    </div>
  );
}

function RitualsScreen() {
  return (
    <div className="space-y-3">
      <div><h2 className="font-display text-2xl font-bold">Daily Rituals</h2><p className="text-xs text-muted-foreground">Tiny 2-minute practices, chosen for how you feel today.</p></div>
      <MiniSection className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl gradient-butter flex items-center justify-center soft-shadow"><Flame className="w-6 h-6 text-white" /></div><div><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Ritual streak</div><div className="font-display text-2xl font-bold text-gradient-pink">2 <span className="text-sm font-sans text-muted-foreground">days</span></div><div className="text-[10px] text-muted-foreground">1 done today · 5 all-time</div></div></MiniSection>
      <MiniSection className="space-y-3"><div className="flex items-start justify-between gap-2"><div><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Today's ritual · matches "Meh"</div><div className="font-display text-xl font-bold mt-1">🌿 Two-minute reset</div><div className="text-[10px] text-muted-foreground">~2 min</div></div><button className="text-[10px] font-semibold text-primary rounded-full bg-white/80 border border-white px-2 py-1">Shuffle</button></div><ol className="space-y-2">{["Put both feet on the floor.", "Take 5 slow breaths.", "Stretch your shoulders and unclench your jaw."].map((s, i) => <li key={s} className="flex gap-2 bg-white/70 rounded-2xl p-2 border border-white text-xs"><span className="font-display font-bold text-primary">{i + 1}.</span><span>{s}</span></li>)}</ol><p className="text-xs text-center italic text-muted-foreground">Tiny still counts.</p><button className="w-full flex items-center justify-center gap-2 rounded-2xl gradient-pink text-white font-semibold py-2 soft-shadow text-xs"><Check className="w-4 h-4" /> I did it</button></MiniSection>
      <MiniSection><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> All rituals</div><div className="grid grid-cols-2 gap-2">{["Breathing", "Grounding", "Stretch", "Journal"].map((r, i) => <button key={r} className="text-left rounded-2xl p-2 border bg-white/70 border-white"><div>{["🌬️", "🌿", "🧘", "📝"][i]}</div><div className="text-xs font-semibold">{r}</div><div className="text-[10px] text-muted-foreground">2 min</div></button>)}</div></MiniSection>
    </div>
  );
}

function WeeklyGlowScreen() {
  return (
    <div className="space-y-3">
      <div><h2 className="font-display text-2xl font-bold">Weekly Glow Report ✨</h2><p className="text-xs text-muted-foreground">Haven💫 gathers your week — your moods, your notes, what helped — and reflects it back.</p></div>
      <MiniSection>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your reflection</div>
        <div className="text-xs leading-relaxed space-y-2"><p><strong>This week had a soft middle.</strong> You checked in as Meh once, but you still logged water and movement.</p><p><strong>What helped:</strong> short resets, journaling, and texting someone you trust.</p><p><strong>Gentle next step:</strong> try one 2-minute ritual before bed.</p></div>
        <button className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-primary"><RefreshCw className="w-3 h-3" /> Regenerate</button>
      </MiniSection>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Share your glow</div>
      <MiniSection className="text-center gradient-pink text-white"><div className="text-4xl">✨</div><div className="font-display text-xl font-bold">Weekly Glow</div><div className="text-sm mt-1">I showed up for myself this week 💗</div><div className="text-[10px] opacity-90 mt-1">One more week, one more layer of care.</div></MiniSection>
    </div>
  );
}

function FriendsScreen() {
  const tasks = [
    { label: "Drink 8 glasses of water 💧", both: true, progress: "You ✓ 8/8 · Them ✓ 8/8" },
    { label: "Move 20+ minutes 🌷", both: false, progress: "You ✓ 25/20 · Them • 8/20" },
    { label: "Mood check-in 💭", both: true, progress: "You ✓ done · Them ✓ done" },
  ];
  return (
    <div className="space-y-3">
      <div><h2 className="font-display text-2xl font-bold">Friends 💗</h2><p className="text-xs text-muted-foreground">Share your progress with people you trust. Keep a shared wellness streak going — like Duolingo, but for feeling good.</p></div>
      <MiniSection><div className="flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-primary" /><div className="font-display font-bold text-sm">Today's wellness tasks</div></div><p className="text-[10px] text-muted-foreground mb-2">Complete any of these to keep your streaks alive with friends.</p><div className="space-y-1.5">{["Water goal", "Move 20+ minutes", "Mood check-in"].map((t, i) => <div key={t} className={`rounded-2xl p-2 border flex items-center gap-2 ${i !== 1 ? "gradient-pink text-white border-white soft-shadow" : "bg-white/70 border-white"}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i !== 1 ? "bg-white/30" : "bg-white border border-border"}`}>{i !== 1 ? "✓" : ""}</div><div><div className="text-xs font-semibold">{t}</div><div className={`text-[10px] ${i !== 1 ? "opacity-90" : "text-muted-foreground"}`}>{i !== 1 ? "Complete" : "In progress"}</div></div></div>)}</div></MiniSection>
      <MiniSection><div className="flex items-center gap-2 bg-white/70 border border-white rounded-2xl px-3 py-2"><Search className="w-4 h-4 text-muted-foreground" /><div className="flex-1 text-xs text-muted-foreground">Search names or @usernames...</div></div><div className="mt-2 flex items-center gap-3 bg-white/70 rounded-2xl p-2 border border-white"><div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center text-lg">🌷</div><div className="flex-1"><div className="font-semibold text-xs">Aanya</div><div className="text-[10px] text-muted-foreground">@aanya</div></div><button className="rounded-full gradient-pink text-white text-[10px] font-semibold px-2 py-1 flex items-center gap-1"><UserPlus className="w-3 h-3" /> Add</button></div></MiniSection>
      <MiniSection><div className="font-display font-bold text-sm mb-2">Friend requests</div><div className="flex items-center gap-2 bg-white/70 rounded-2xl p-2 border border-white"><div className="w-8 h-8 rounded-xl gradient-lavender flex items-center justify-center">🌼</div><div className="flex-1"><div className="font-semibold text-xs">Mia</div><div className="text-[10px] text-muted-foreground">wants to be friends</div></div><button className="rounded-full gradient-pink text-white text-[10px] font-semibold px-2 py-1">Accept</button><button className="rounded-full bg-white/80 border border-white text-[10px] font-semibold px-2 py-1">Decline</button></div></MiniSection>
      <MiniSection><div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /><div className="font-display font-bold text-sm">Your friends</div></div><div className="bg-white/70 rounded-2xl p-2 border border-white"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center text-lg">🌷</div><div className="flex-1"><div className="font-semibold text-xs">Aanya</div><div className="text-[10px] text-muted-foreground">@aanya</div></div><div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-white/80 border border-white rounded-full px-2 py-1"><Flame className="w-3 h-3" /> 4</div></div><div className="text-[10px] text-muted-foreground mt-2">A box turns pink only when BOTH of you complete it today 🌸</div><div className="mt-2 space-y-1.5">{tasks.map((t) => <div key={t.label} className={`rounded-2xl p-2 border flex items-center gap-2 ${t.both ? "gradient-pink text-white border-white soft-shadow" : "bg-white/80 border-white"}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${t.both ? "bg-white/30" : "bg-white border border-border"}`}>{t.both ? "✓" : ""}</div><div><div className="text-[11px] font-semibold">{t.label}</div><div className={`text-[9px] ${t.both ? "opacity-90" : "text-muted-foreground"}`}>{t.progress}</div></div></div>)}</div></div></MiniSection>
      <MiniSection><div className="font-display font-bold text-sm mb-2">Sent requests</div><div className="flex items-center gap-2 bg-white/70 rounded-2xl p-2 border border-white"><div className="w-8 h-8 rounded-xl gradient-butter flex items-center justify-center">🌻</div><div className="flex-1"><div className="font-semibold text-xs">Jordan</div><div className="text-[10px] text-muted-foreground">Request pending</div></div><button className="rounded-full bg-white/80 border border-white text-[10px] font-semibold px-2 py-1">Cancel</button></div></MiniSection>
    </div>
  );
}

function SymptomsScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">Symptom check</h2><p className="text-xs text-muted-foreground">Describe how you feel — I'll ask a few questions.</p></div><button className="text-[10px] font-semibold text-primary">New check</button></div>
      <MiniSection><div className="flex items-start gap-2"><div className="w-9 h-9 rounded-2xl gradient-lavender flex items-center justify-center"><Heart className="w-4 h-4 text-white" fill="white" /></div><div><div className="font-display font-bold text-sm">Tell me what's going on 🌸</div><p className="text-xs text-muted-foreground mt-1">For example: "I have a sore throat and a fever", or "My stomach's been hurting since this morning."</p></div></div></MiniSection>
      <div className="space-y-2"><div className="flex justify-end"><div className="max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-line text-xs gradient-pink text-white">My throat hurts and I feel warm.</div></div><div className="flex justify-start"><div className="max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-line text-xs glass-card">I can help you think through this. Do you have a fever, trouble breathing, chest pain, or symptoms that feel severe?</div></div></div>
      <div className="rounded-2xl p-3 soft-shadow gradient-butter"><div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5" /><div><div className="font-display font-bold text-sm">🟡 Schedule an appointment</div><p className="text-xs opacity-90 mt-1">Consider seeing a healthcare provider.</p><p className="text-[10px] opacity-70 mt-2">This is educational guidance from an AI companion, not a medical diagnosis.</p></div></div></div>
      <div className="glass-card p-2 flex items-end gap-2"><div className="flex-1 bg-transparent px-3 py-2 text-xs text-muted-foreground">Describe how you're feeling...</div><button className="rounded-xl gradient-pink p-3 soft-shadow"><Send className="w-4 h-4 text-white" /></button></div>
    </div>
  );
}

function ProfileScreen() {
  const themes = [
    { label: "Female", colors: ["#ffd1e0", "#ff8fb1"], icon: <MoodFlower mood="Great" size={44} /> },
    { label: "Male", colors: ["#c6ddff", "#4c86ff"], icon: <MoodCar mood="Great" size={44} /> },
    { label: "Non-binary", colors: ["#e5d1ff", "#a26bff"], icon: <MoodFlower mood="Great" size={44} /> },
    { label: "Other", colors: ["#fff4c2", "#ffc93a"], icon: <MoodFlower mood="Great" size={44} /> },
  ];
  return (
    <div className="space-y-3">
      <div><h2 className="font-display text-2xl font-bold">Your profile</h2><p className="text-xs text-muted-foreground">Update anything anytime — it helps Haven and your coach personalize things.</p></div>
      <MiniSection className="space-y-3"><DemoField label="Display name" value="Ellea" /><DemoField label="Username" value="@ellea" /><div className="grid grid-cols-2 gap-2"><DemoField label="Age" value="16" /><div><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Gender</div><div className="rounded-2xl bg-white/80 border border-white px-3 py-2 text-xs">Female</div></div></div><p className="text-[10px] text-muted-foreground">Choosing Male switches to a cooler blue theme with a sports-car journey. Non-binary is purple, Other is yellow.</p></MiniSection>
      <MiniSection><div className="flex items-center gap-2 mb-2"><Palette className="w-4 h-4 text-primary" /><div className="font-display font-bold text-sm">Theme options</div></div><div className="grid grid-cols-2 gap-2">{themes.map((t) => <div key={t.label} className="rounded-2xl bg-white/70 border border-white p-2"><div className="text-[10px] font-semibold">{t.label}</div><div className="flex gap-1 my-1">{t.colors.map((c) => <span key={c} className="w-4 h-4 rounded-full border border-white" style={{ background: c }} />)}</div><div className="flex justify-center">{t.icon}</div></div>)}</div></MiniSection>
      <MiniSection><div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-primary" /><div className="text-sm font-semibold">Haven💫's personality</div></div><p className="text-[10px] text-muted-foreground mb-2">Choose the vibe that helps you most.</p>{["Gentle guide", "Hype bestie", "Calm sage", "Silly comfort friend"].map((p, idx) => <div key={p} className={`rounded-2xl p-2 border text-xs mb-1.5 ${idx === 0 ? "gradient-pink text-white soft-shadow border-transparent" : "bg-white/70 border-white"}`}><div className="font-display font-bold">{p}</div></div>)}</MiniSection>
      <button className="w-full rounded-2xl gradient-pink text-white font-semibold py-3 soft-shadow flex items-center justify-center gap-2 text-xs"><Save className="w-4 h-4" /> Save changes</button>
      <MiniSection className="border border-destructive/30"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /><div className="text-sm font-semibold">Privacy</div></div><p className="text-[10px] text-muted-foreground mt-1">Your journal entries, chats, and check-ins stay private to your account. You can delete everything at any time.</p><button className="mt-2 w-full rounded-2xl border border-destructive/40 text-destructive font-semibold py-2 text-xs">Delete my account</button></MiniSection>
    </div>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</div><div className="rounded-2xl bg-white/80 border border-white px-3 py-2 text-xs">{value}</div></div>;
}

function buildFullPitchScript(name: string): string {
  return `VITASENSE AI — DEMO PITCH SCRIPT

OPENING HOOK
Everyone says "check in with yourself," but how do you actually do that? VitaSense AI is the daily wellness companion that makes it feel natural, not like homework.

SLIDE 1 — HOME
"${greeting()}, ${name}" — the app greets you by name and time of day. Right away you see the daily health score card, smart nudges, a little quote, your great-day streak, and a mood tracker that resets every Monday. This is your home base.

SLIDE 2 — SCHEDULE
Your score is built from what you actually log each day: water, sleep, movement, meals, mood, screen time, and notes. Just slide the bars and tap save — it updates instantly. No wearables, no judgment — just a quick honest check-in.

SLIDE 3 — MOD & ANXIETY
Feeling off? The Mood tab has two parts: Mood and Anxiety. Pick how you feel — Great, Good, Meh, Low, or Overwhelmed — and write a private note. The Anxiety tab gives a short quiz and a score out of 10, then a gentle plan. Everything stays private.

SLIDE 4 — HAVEN CHAT
Haven is your separate, judgment-free chat space. You can type, send a voice note, or tap quick starters like "I need to vent" or "Move me." There's a "Generate a grounding exercise" button when you want it, and Haven remembers things from your chats so it feels personal.

SLIDE 5 — JOURNEY
The Journey page shows your flower or car, depending on your theme. You get a weekly garden, achievements, mood distribution, health score trends, and a timeline. It's a visual record of showing up for yourself.

SLIDE 6 — RITUALS
Rituals are tiny 2-minute practices matched to how you feel. Since this user is feeling "Meh," the demo shows a two-minute reset: feet on the floor, five slow breaths, stretch shoulders. You can shuffle, mark it done, and build a ritual streak.

SLIDE 7 — WEEKLY GLOW
Every week, Haven gives you a Weekly Glow Report — it looks at your moods, notes, and what helped, and reflects it back. Plus you can share a beautiful progress card with friends or save it as motivation.

SLIDE 8 — FRIENDS
Friends make it social. Search for people, accept requests, and keep shared wellness streaks. Each box only turns pink when BOTH of you complete the task — like Duolingo, but for feeling good.

SLIDE 9 — SYMPTOMS
There's also a symptom assistant for when you're not feeling well. It asks follow-up questions, gives safety guidance, and flags serious symptoms — but it's always clear that Haven is a supportive companion, not a doctor.

SLIDE 10 — PROFILE
Finally, your profile. Set your display name, username, age, gender, and choose from four themes: pink for Female, blue for Male, purple for Non-binary, and yellow for Other. You can also pick Haven's personality — gentle guide, hype bestie, calm sage, or silly comfort friend.

CLOSING LINE
VitaSense AI is built by Ellea Pepe. The mission is simple: make wellness feel supportive, beautiful, and actually yours. Try the demo, or sign up and meet Haven💫.`;
}

function CopyPitchScript({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const script = buildFullPitchScript(name);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and show text in a modal
      setCopied(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-6">
      <button
        onClick={copy}
        className="w-full rounded-2xl gradient-pink text-white font-semibold py-3 soft-shadow inline-flex items-center justify-center gap-2"
      >
        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Pencil className="w-4 h-4" /> Copy pitch script to notes</>}
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">Copies the full 10-slide script so you can paste it anywhere.</p>
    </div>
  );
}