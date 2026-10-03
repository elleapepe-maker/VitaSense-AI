import { useEffect, useState } from "react";
import { Heart, Star, Sparkles } from "lucide-react";
import { tapped, celebrate } from "@/lib/feedback";

const SCREENS = [
  {
    icon: Heart,
    emoji: "🌸",
    title: "Welcome to VitaSense AI",
    body: "A soft little space that notices how you're doing — your body and your feelings — and gently tells you what you need.",
    tint: "gradient-pink",
  },
  {
    icon: Star,
    emoji: "💫",
    title: "Meet Haven💫",
    body: "Your warm AI companion. Vent, share a photo, ask for a grounding exercise. She remembers what helps you.",
    tint: "gradient-lavender",
  },
  {
    icon: Sparkles,
    emoji: "🌈",
    title: "Watch yourself bloom",
    body: "Daily check-ins grow a garden of your moods, build streaks, and turn your week into a little glow report.",
    tint: "gradient-mint",
  },
] as const;

export function WelcomeIntro() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("vs_seen_intro") === "1") return;
    setOpen(true);
  }, []);

  const close = () => {
    localStorage.setItem("vs_seen_intro", "1");
    celebrate();
    setOpen(false);
  };

  if (!open) return null;
  const s = SCREENS[step];
  const last = step === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5 bg-foreground/25 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-sm p-8 text-center relative overflow-hidden">
        <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full ${s.tint} opacity-40 blur-3xl breathe`} />
        <div className="relative">
          <div className={`w-16 h-16 mx-auto rounded-3xl ${s.tint} flex items-center justify-center soft-shadow animate-scale-in`}>
            <s.icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl mt-4">{s.emoji}</div>
          <h2 key={s.title} className="font-display text-2xl font-bold mt-2 animate-fade-in">{s.title}</h2>
          <p key={s.body} className="text-sm text-muted-foreground mt-2 leading-relaxed animate-fade-in">{s.body}</p>

          <div className="flex items-center justify-center gap-1.5 mt-6">
            {SCREENS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 gradient-pink" : "w-1.5 bg-muted"}`} />
            ))}
          </div>

          <button
            onClick={() => {
              if (last) return close();
              tapped();
              setStep(step + 1);
            }}
            className="mt-5 w-full rounded-full gradient-pink px-6 py-3 font-semibold text-white soft-shadow hover:scale-[1.02] transition"
          >
            {last ? "Let's begin 💗" : "Next"}
          </button>
          <button onClick={close} className="mt-2 text-xs text-muted-foreground hover:text-primary">
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}
