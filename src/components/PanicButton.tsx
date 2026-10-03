import { useEffect, useRef, useState } from "react";
import { LifeBuoy, X, Phone, MessageSquare, Globe, Wind, Eye, Hand, Snowflake, Heart, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Exercise definitions                                              */
/* ------------------------------------------------------------------ */

type Phase = { label: string; seconds: number; scale: number };

type Exercise = {
  id: string;
  name: string;
  icon: typeof Wind;
  blurb: string;
  /** Timed breathing-style exercise with an animated circle */
  phases?: Phase[];
  /** Step-through exercise (tap "next" at your own pace) */
  steps?: string[];
};

const EXERCISES: Exercise[] = [
  {
    id: "box",
    name: "Box breathing",
    icon: Wind,
    blurb: "Slow, even breaths to tell your body it's safe.",
    phases: [
      { label: "Breathe in…", seconds: 4, scale: 1.35 },
      { label: "Hold…", seconds: 4, scale: 1.35 },
      { label: "Breathe out…", seconds: 4, scale: 0.75 },
      { label: "Hold…", seconds: 4, scale: 0.75 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 calm",
    icon: Heart,
    blurb: "Longer exhales slow a racing heart fast.",
    phases: [
      { label: "Breathe in through your nose…", seconds: 4, scale: 1.4 },
      { label: "Hold gently…", seconds: 7, scale: 1.4 },
      { label: "Slow breath out through your mouth…", seconds: 8, scale: 0.7 },
    ],
  },
  {
    id: "54321",
    name: "5-4-3-2-1 grounding",
    icon: Eye,
    blurb: "Pull yourself out of your head and into the room.",
    steps: [
      "Look around and name 5 things you can SEE. Say them out loud if you can.",
      "Notice 4 things you can FEEL — your feet on the floor, fabric, air, temperature.",
      "Listen for 3 things you can HEAR, even quiet ones.",
      "Find 2 things you can SMELL — or 2 smells you love.",
      "Name 1 thing you can TASTE, or one thing you like about yourself.",
      "You're here. You're in this room. You made it through this moment. 💗",
    ],
  },
  {
    id: "muscle",
    name: "Muscle release",
    icon: Hand,
    blurb: "Squeeze then let go — panic lives in tight muscles.",
    steps: [
      "Squeeze both fists tight for 5 seconds… then let go completely.",
      "Scrunch your shoulders up to your ears for 5 seconds… then drop them.",
      "Press your feet hard into the floor for 5 seconds… then relax.",
      "Squeeze your whole face — eyes, jaw — for 5 seconds… then soften.",
      "Notice the heaviness left behind. That's your body letting go.",
    ],
  },
  {
    id: "cold",
    name: "Temperature reset",
    icon: Snowflake,
    blurb: "Cold on the skin interrupts a panic spiral quickly.",
    steps: [
      "Run cold water over your wrists for 30 seconds.",
      "Splash cool water on your face, or hold something cold to your cheeks.",
      "Take one slow sip of cold water and notice it going down.",
      "Breathe out longer than you breathed in, twice.",
      "Your nervous system just got a reset signal. Well done.",
    ],
  },
  {
    id: "butterfly",
    name: "Butterfly hug",
    icon: Sparkles,
    blurb: "Gentle self-soothing tapping used by therapists.",
    steps: [
      "Cross your arms over your chest, hands resting near your shoulders.",
      "Tap left… right… left… right, slowly, like a heartbeat. Keep going for 30 seconds.",
      "While tapping, say quietly: “I am safe right now.”",
      "Keep tapping and take three slow breaths.",
      "Let your arms fall. Notice anything that feels even 1% calmer.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Timed breathing runner                                            */
/* ------------------------------------------------------------------ */

function BreathRunner({ phases }: { phases: Phase[] }) {
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(phases[0].seconds);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setIdx(0);
    setLeft(phases[0].seconds);
    setElapsed(0);
    setRunning(true);
  }, [phases]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setLeft((l) => {
        if (l > 1) return l - 1;
        setIdx((i) => {
          const next = (i + 1) % phases.length;
          setLeft(phases[next].seconds);
          return next;
        });
        return phases[(idx + 1) % phases.length].seconds;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, idx, phases]);

  const phase = phases[idx];

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full gradient-pink opacity-30"
          style={{
            transform: `scale(${phase.scale})`,
            transition: `transform ${phase.seconds}s ease-in-out`,
          }}
        />
        <div
          className="absolute inset-4 rounded-full gradient-pink opacity-60"
          style={{
            transform: `scale(${phase.scale})`,
            transition: `transform ${phase.seconds}s ease-in-out`,
          }}
        />
        <div className="relative text-center text-white font-display font-bold text-4xl drop-shadow">{left}</div>
      </div>

      <div className="text-center">
        <div className="font-display font-bold text-lg">{phase.label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} of calm so far
        </div>
      </div>

      <button
        onClick={() => setRunning((r) => !r)}
        className="rounded-2xl bg-white/80 border border-white px-4 py-2 text-sm font-semibold hover:bg-white transition"
      >
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step-through runner                                               */
/* ------------------------------------------------------------------ */

function StepRunner({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [steps]);
  const last = i >= steps.length - 1;

  return (
    <div className="py-2 space-y-4">
      <div className="flex items-center justify-center gap-1.5">
        {steps.map((_, n) => (
          <span
            key={n}
            className={`h-1.5 rounded-full transition-all ${n <= i ? "w-7 gradient-pink" : "w-3 bg-primary/20"}`}
          />
        ))}
      </div>
      <div className="glass-card p-5 text-center min-h-[120px] flex items-center justify-center">
        <p className="text-base leading-relaxed">{steps[i]}</p>
      </div>
      <div className="flex gap-2">
        {i > 0 && (
          <button
            onClick={() => setI((v) => v - 1)}
            className="flex-1 rounded-2xl bg-white/80 border border-white py-2.5 font-semibold hover:bg-white transition"
          >
            Back
          </button>
        )}
        <button
          onClick={() => setI((v) => (last ? 0 : v + 1))}
          className="flex-1 rounded-2xl gradient-pink text-white font-semibold py-2.5 soft-shadow"
        >
          {last ? "Start over" : "Next step"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hotlines                                                          */
/* ------------------------------------------------------------------ */

const HOTLINES = [
  {
    icon: Phone,
    href: "tel:988",
    label: "Call or text 988",
    sub: "Suicide & Crisis Lifeline (US) — 24/7, free",
  },
  {
    icon: MessageSquare,
    href: "sms:741741&body=HOME",
    label: "Text HOME to 741741",
    sub: "Crisis Text Line — talk by text, 24/7",
  },
  {
    icon: Phone,
    href: "tel:18006624357",
    label: "Call 1-800-662-4357",
    sub: "SAMHSA National Helpline — free, confidential",
  },
  {
    icon: Phone,
    href: "tel:18664887386",
    label: "Call 1-866-488-7386",
    sub: "The Trevor Project — LGBTQ+ young people",
  },
  {
    icon: Globe,
    href: "https://findahelpline.com",
    label: "findahelpline.com",
    sub: "Free helplines in over 130 countries",
    external: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Main panic button                                                 */
/* ------------------------------------------------------------------ */

export function PanicButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"calm" | "help">("calm");
  const [active, setActive] = useState<Exercise>(EXERCISES[0]);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => {
          setOpen(true);
          setTab("calm");
        }}
        aria-label="Open calm-down help"
        className="fixed bottom-28 right-4 z-40 flex items-center gap-2 rounded-full gradient-pink text-white font-bold px-4 py-3 soft-shadow hover:scale-105 active:scale-95 transition"
      >
        <LifeBuoy className="w-5 h-5" />
        <span className="text-sm">Calm me</span>
      </button>

      {!open ? null : (
        <div
          className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Calm down and crisis help"
            className="glass-card w-full max-w-lg max-h-[88vh] overflow-y-auto p-5 relative"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full p-2 bg-white/80 border border-white hover:bg-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <div className="font-display font-bold text-xl">You're okay. Let's slow this down 💗</div>
              <p className="text-sm text-muted-foreground mt-1">
                Pick something below. Nothing here is a test — do whatever feels doable.
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTab("calm")}
                className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                  tab === "calm" ? "gradient-pink text-white soft-shadow" : "bg-white/70 border border-white"
                }`}
              >
                Calm-down exercises
              </button>
              <button
                onClick={() => setTab("help")}
                className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                  tab === "help" ? "gradient-pink text-white soft-shadow" : "bg-white/70 border border-white"
                }`}
              >
                Talk to someone now
              </button>
            </div>

            {tab === "calm" ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {EXERCISES.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => setActive(ex)}
                      className={`text-left rounded-2xl p-3 border transition ${
                        active.id === ex.id
                          ? "gradient-pink text-white border-transparent soft-shadow"
                          : "bg-white/70 border-white hover:bg-white"
                      }`}
                    >
                      <ex.icon className="w-4 h-4 mb-1" />
                      <div className="text-sm font-semibold leading-tight">{ex.name}</div>
                      <div
                        className={`text-[11px] leading-snug mt-0.5 ${
                          active.id === ex.id ? "text-white/85" : "text-muted-foreground"
                        }`}
                      >
                        {ex.blurb}
                      </div>
                    </button>
                  ))}
                </div>

                {active.phases ? <BreathRunner phases={active.phases} /> : <StepRunner steps={active.steps ?? []} />}

                <button
                  onClick={() => setTab("help")}
                  className="w-full text-center text-xs text-muted-foreground underline hover:text-primary transition"
                >
                  Still not okay? Talk to a real person →
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  These are free, confidential, and open 24/7. You are allowed to call even if you're “not sure it's bad
                  enough.”
                </p>
                {HOTLINES.map((h) => (
                  <a
                    key={h.href}
                    href={h.href}
                    {...(h.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="flex items-start gap-3 rounded-2xl bg-white/80 border border-white px-3 py-2.5 hover:bg-white transition"
                  >
                    <h.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-sm font-semibold">{h.label}</span>
                      <span className="block text-xs text-muted-foreground">{h.sub}</span>
                    </span>
                  </a>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  If you or someone else is in immediate danger, call your local emergency number. Haven💫 is a
                  supportive companion, not a doctor.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
