/**
 * Appearance + accessibility preferences, plus the gentle time-of-day
 * "breathing" background. All stored locally on the device.
 */

export type Prefs = {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  sounds: boolean;
  haptics: boolean;
};

const KEYS: Record<keyof Prefs, string> = {
  largeText: "vs_large_text",
  highContrast: "vs_contrast",
  reduceMotion: "vs_reduce_motion",
  sounds: "vs_sounds",
  haptics: "vs_haptics",
};

const DEFAULTS: Prefs = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  sounds: true,
  haptics: true,
};

export function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  const out = { ...DEFAULTS };
  (Object.keys(KEYS) as (keyof Prefs)[]).forEach((k) => {
    const v = localStorage.getItem(KEYS[k]);
    if (v !== null) out[k] = v === "1";
  });
  return out;
}

export function writePref<K extends keyof Prefs>(key: K, value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS[key], value ? "1" : "0");
  applyPrefs();
}

export function timeOfDay(d = new Date()): "dawn" | "day" | "dusk" | "night" {
  const h = d.getHours();
  if (h < 8) return "dawn";
  if (h < 17) return "day";
  if (h < 21) return "dusk";
  return "night";
}

export function applyPrefs() {
  if (typeof document === "undefined") return;
  const p = readPrefs();
  const el = document.documentElement;
  el.classList.toggle("a11y-large-text", p.largeText);
  el.classList.toggle("a11y-contrast", p.highContrast);
  el.classList.toggle("a11y-reduce-motion", p.reduceMotion);
  el.dataset.tod = timeOfDay();
}
