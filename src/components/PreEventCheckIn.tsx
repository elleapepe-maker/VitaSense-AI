import { useState } from "react";
import { Trophy, Activity, Heart, X, CheckCircle, Flame } from "lucide-react";
import { celebrate, tapped } from "@/lib/feedback";

type FormData = { sport: string; nervousFor: string; intensity: number };

const EMPTY: FormData = { sport: "", nervousFor: "", intensity: 5 };

export function PreEventCheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [breathing, setBreathing] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "intensity" ? Number(value) : value }));
  };

  const resetForm = () => {
    setIsOpen(false);
    setStep(1);
    setFormData(EMPTY);
    setBreathing(false);
  };

  const generatePlan = () => {
    tapped();
    setStep(2);
    celebrate();
  };

  const lockItIn = () => {
    celebrate();
    resetForm();
  };

  // Encouragement tuned to butterfly intensity
  const butterflies = formData.intensity;
  const courage = butterflies >= 8
    ? "That big surge of energy? It means this matters to you. Channel it — you're wired for this moment."
    : butterflies >= 5
      ? "A few butterflies is just readiness knocking. You've trained for exactly this."
      : "Calm and grounded — perfect flow state. Trust your preparation.";

  return (
    <div>
      {/* Floating trigger — sits above the Calm me button */}
      <button
        onClick={() => {
          tapped();
          setIsOpen(true);
        }}
        aria-label="Pre-game or event check-in"
        className="fixed bottom-44 right-4 z-40 flex items-center gap-2 rounded-full gradient-pink text-white font-bold px-4 py-3 soft-shadow hover:scale-105 active:scale-95 transition"
      >
        <Trophy className="w-5 h-5 animate-pulse" />
        <span className="text-sm">Pre-Game / Event Nerves</span>
      </button>

      {/* Pop-up Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-3xl w-full max-w-md p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full gradient-pink opacity-30 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* STEP 1: The Survey Questions */}
            {step === 1 && (
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl gradient-pink flex items-center justify-center soft-shadow">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Athlete Mindset Check</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">
                      What sport or event are you crushing today?
                    </label>
                    <input
                      type="text"
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      placeholder="e.g., Tennis Match, Dance Solo, Track Meet"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">
                      What specific thing is making you feel nervous?
                    </label>
                    <textarea
                      name="nervousFor"
                      value={formData.nervousFor}
                      onChange={handleInputChange}
                      placeholder="e.g., Messing up the choreography, a tough opponent"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60 h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1 flex justify-between">
                      <span>How heavy are the stomach butterflies?</span>
                      <span className="text-primary font-bold">{formData.intensity}/10</span>
                    </label>
                    <input
                      type="range"
                      name="intensity"
                      min="1"
                      max="10"
                      value={formData.intensity}
                      onChange={handleInputChange}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={generatePlan}
                    disabled={!formData.sport || !formData.nervousFor}
                    className="w-full gradient-pink text-white font-bold py-3 rounded-xl soft-shadow hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    Generate Game Plan →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: The Mindset Flip & Plan */}
            {step === 2 && (
              <div className="text-center py-2 relative">
                <div className="w-16 h-16 gradient-mint rounded-full flex items-center justify-center mx-auto mb-4 soft-shadow">
                  <Heart className="w-8 h-8 text-white animate-bounce" />
                </div>

                <h2 className="text-2xl font-display font-extrabold mb-2">You Got This! 💗</h2>

                <div className="glass-card rounded-2xl p-4 text-left my-4 border border-border">
                  <p className="text-sm leading-relaxed">
                    Those <span className="font-bold text-primary">{formData.intensity}/10 butterflies</span> aren't fear — it's your inner fire preparing for action. You're completely ready for your{" "}
                    <span className="font-bold">{formData.sport}</span>.
                  </p>
                  <p className="text-sm mt-2 leading-relaxed text-muted-foreground">
                    {courage}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed">
                    Let's use that adrenaline as rocket fuel to overcome{" "}
                    <span className="font-medium italic text-primary">"{formData.nervousFor}"</span>.
                  </p>
                </div>

                {/* 60-Second Reset Drill */}
                <div className="glass-card rounded-xl p-4 mb-4 border border-border flex flex-col items-center justify-center relative">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">
                    60-Second Reset Drill
                  </span>
                  <div className="relative h-12 w-12 flex items-center justify-center my-2">
                    {breathing && (
                      <span className="absolute w-12 h-12 rounded-full gradient-pink opacity-40 animate-ping" />
                    )}
                    <span className="w-9 h-9 rounded-full gradient-pink text-white flex items-center justify-center text-lg relative z-10 breathe">
                      🫁
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {breathing ? "Inhale 4s · Hold 4s · Exhale 6s" : "Tap to start"}
                  </p>
                  {!breathing && (
                    <button
                      onClick={() => {
                        tapped();
                        setBreathing(true);
                      }}
                      className="mt-2 text-xs font-semibold text-primary"
                    >
                      Start breathing
                    </button>
                  )}
                </div>

                <button
                  onClick={lockItIn}
                  className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Lock It In & Play</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PreEventCheckIn;
