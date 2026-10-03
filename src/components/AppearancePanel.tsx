import { useEffect, useState } from "react";
import { Accessibility, Type, Contrast, Wind, Volume2, Vibrate } from "lucide-react";
import { readPrefs, writePref, applyPrefs, type Prefs } from "@/lib/appearance";
import { tapped } from "@/lib/feedback";

const ROWS: { key: keyof Prefs; label: string; hint: string; icon: typeof Type }[] = [
  { key: "largeText", label: "Bigger text", hint: "Everything gets a little easier to read.", icon: Type },
  { key: "highContrast", label: "Higher contrast", hint: "Stronger text and outlines.", icon: Contrast },
  { key: "reduceMotion", label: "Calm motion", hint: "Turns off gentle animations.", icon: Wind },
  { key: "sounds", label: "Soft sounds", hint: "Tiny chimes when you check in.", icon: Volume2 },
  { key: "haptics", label: "Little buzzes", hint: "A soft vibration on phones.", icon: Vibrate },
];

export function AppearancePanel() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    setPrefs(readPrefs());
    applyPrefs();
  }, []);

  if (!prefs) return null;

  const toggle = (key: keyof Prefs) => {
    const next = !prefs[key];
    writePref(key, next);
    setPrefs({ ...prefs, [key]: next });
    tapped();
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Accessibility className="w-4 h-4 text-primary" />
        <h2 className="font-display font-bold text-lg">Comfort & accessibility</h2>
      </div>
      <p className="text-xs text-muted-foreground">Saved on this device only.</p>
      <div className="space-y-2">
        {ROWS.map((r) => (
          <button
            key={r.key}
            onClick={() => toggle(r.key)}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-white/60 p-3 text-left hover:bg-white transition"
            aria-pressed={prefs[r.key]}
          >
            <span className="w-9 h-9 rounded-xl gradient-lavender flex items-center justify-center shrink-0">
              <r.icon className="w-4 h-4" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-sm">{r.label}</span>
              <span className="block text-xs text-muted-foreground">{r.hint}</span>
            </span>
            <span className={`w-11 h-6 rounded-full p-0.5 transition ${prefs[r.key] ? "gradient-pink" : "bg-muted"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white soft-shadow transition ${prefs[r.key] ? "translate-x-5" : ""}`} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
