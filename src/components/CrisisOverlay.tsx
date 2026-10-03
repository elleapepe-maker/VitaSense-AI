import { useEffect, useState } from "react";
import { Phone, MessageSquare, Globe, Sparkles, X, HeartHandshake } from "lucide-react";
import { detectCrisis } from "@/components/CrisisCare";
import { tapped } from "@/lib/feedback";

const GROUNDING = [
  { title: "Breathe with me", steps: ["Breathe in slowly for 4", "Hold gently for 4", "Breathe out for 6", "Rest for 2 — then again, 4 more times"] },
  { title: "5-4-3-2-1 senses", steps: ["Name 5 things you can see", "4 things you can touch", "3 things you can hear", "2 things you can smell", "1 slow, kind breath"] },
  { title: "Warm and soft", steps: ["Hold something warm — a mug, a blanket", "Put a hand on your heart", "Say: this feeling is heavy, and it will move", "Text one person who feels safe"] },
];

/**
 * Watches text the user is typing (journal notes, Haven chat, symptom notes) and
 * opens the gentle full-screen crisis card the moment something worrying appears.
 * Re-arms once the phrase is gone, so it never nags in a loop.
 */
export function useCrisisWatch(texts: (string | null | undefined)[]) {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(true);
  const hit = texts.some((t) => detectCrisis(t ?? ""));

  useEffect(() => {
    if (hit && armed) {
      setOpen(true);
      setArmed(false);
    }
    if (!hit && !armed) setArmed(true);
  }, [hit, armed]);

  return { open, close: () => setOpen(false) };
}

export function CrisisOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (!open) setShowSteps(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-foreground/40 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-md p-7 space-y-5 border-2 border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <div className="w-14 h-14 rounded-2xl gradient-pink flex items-center justify-center soft-shadow shrink-0">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <button
            onClick={() => { tapped(); onClose(); }}
            aria-label="Close"
            className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl leading-snug">
            Hey — things feel really heavy right now 💗
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You don't have to carry this alone. A real, kind person is ready to listen this very minute,
            and we can slow your body down together in the meantime.
          </p>
        </div>

        <div className="space-y-2">
          <a
            href="tel:988"
            className="flex items-center gap-2 rounded-2xl gradient-pink text-white px-4 py-3 text-sm font-bold soft-shadow hover:scale-[1.01] transition"
          >
            <Phone className="w-4 h-4" />
            Talk to a real person now — call 988
          </a>
          <a
            href="sms:741741&body=HOME"
            className="flex items-center gap-2 rounded-2xl bg-white/80 border border-white px-4 py-3 text-sm font-semibold hover:bg-white transition"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            Rather text? Send HOME to 741741
          </a>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-2xl bg-white/80 border border-white px-4 py-3 text-sm font-semibold hover:bg-white transition"
          >
            <Globe className="w-4 h-4 text-primary" />
            Outside the US — findahelpline.com
          </a>
          <button
            onClick={() => { tapped(); setShowSteps((s) => !s); }}
            className="w-full flex items-center gap-2 rounded-2xl gradient-lavender text-white px-4 py-3 text-sm font-semibold soft-shadow"
          >
            <Sparkles className="w-4 h-4" />
            {showSteps ? "Hide my grounding steps" : "See my grounding steps"}
          </button>
        </div>

        {showSteps && (
          <div className="space-y-3">
            {GROUNDING.map((g) => (
              <div key={g.title} className="rounded-2xl bg-white/70 border border-white p-4">
                <div className="font-display font-bold text-sm mb-2">{g.title}</div>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                  {g.steps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          If you or someone else is in immediate danger, please call your local emergency number.
        </p>
        <button
          onClick={() => { tapped(); onClose(); }}
          className="w-full text-xs font-semibold text-muted-foreground hover:text-primary transition"
        >
          I'm okay for now — close this
        </button>
      </div>
    </div>
  );
}
