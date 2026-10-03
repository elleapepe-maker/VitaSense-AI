import { useState } from "react";
import { HelpCircle, X, Heart, Star, Stethoscope, Smile, Flower2, Sparkles, Calendar, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  {
    title: "Welcome to VitaSense AI",
    body: "Your soft, gentle space to check in with yourself, chat with Haven💫, and track your wellbeing over time. Here's how everything works.",
    icon: Heart,
    tint: "gradient-pink",
  },
  {
    title: "Home — your daily snapshot",
    body: "Your Home tab shows your health score, today's inspirational quote, great-day streak, and a quick mood tracker. Tap your score card to edit your schedule.",
    icon: Heart,
    tint: "gradient-pink",
  },
  {
    title: "Haven💫 — chat freely",
    body: "Tap Haven💫 to vent, celebrate, or ask anything. It's warm, judgement-free, and always on your side. No pressure, just gentle support.",
    icon: Star,
    tint: "gradient-lavender",
  },
  {
    title: "Symptoms — feel heard",
    body: "Use the Symptoms tab when something feels off. Describe how you're feeling and get gentle, AI-powered guidance about possible next steps.",
    icon: Stethoscope,
    tint: "gradient-mint",
  },
  {
    title: "Mood — quick check-ins",
    body: "The Mood tab has short mood and anxiety quizzes. After each one, you can keep chatting with the bot for tips, comfort, and follow-up questions.",
    icon: Smile,
    tint: "gradient-butter",
  },
  {
    title: "Journey — your progress flower",
    body: "Journey shows your timeline, mood flower, and streaks. The flower changes color based on your daily mood — check the key inside to see what each shade means.",
    icon: Flower2,
    tint: "gradient-pink",
  },
  {
    title: "Coach — daily wellness tips",
    body: "Your Coach tab gives personalized, gentle tips for water, sleep, movement, meals, and mindset — updated based on your check-ins.",
    icon: Sparkles,
    tint: "gradient-lavender",
  },
  {
    title: "Schedule — keep your score accurate",
    body: "Log your daily habits in the Schedule tab. The more honest you are about water, sleep, movement, meals, and screen time, the more accurate your health score becomes.",
    icon: Calendar,
    tint: "gradient-mint",
  },
];

export function HelpGuideButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition"
        aria-label="Help guide"
        title="Help guide"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && <HelpGuideModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function HelpGuideModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const Icon = step.icon;

  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in slide-in-from-bottom-4">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/70 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-3xl ${step.tint} flex items-center justify-center soft-shadow mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Step {index + 1} of {steps.length}
          </div>
          <h3 className="font-display text-2xl font-bold mb-3">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{step.body}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition ${i === index ? "gradient-pink" : "bg-muted-foreground/30"}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={prev}
              disabled={index === 0}
              className="flex items-center justify-center gap-1 rounded-2xl bg-white/70 border border-white py-2.5 px-4 font-semibold text-sm hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {index === steps.length - 1 ? (
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl gradient-pink py-2.5 font-semibold text-sm soft-shadow hover:scale-[1.02] transition"
              >
                Got it 🌸
              </button>
            ) : (
              <button
                onClick={next}
                className="flex-1 rounded-2xl gradient-pink py-2.5 font-semibold text-sm soft-shadow hover:scale-[1.02] transition flex items-center justify-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
