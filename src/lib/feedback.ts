/**
 * Tiny haptic + sound micro-interactions.
 * Both respect the user's Appearance settings (localStorage).
 */

function on(key: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(key) !== "0";
}

export function haptic(pattern: number | number[] = 12) {
  if (!on("vs_haptics")) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

type Chime = "tap" | "success" | "send" | "unlock";

const NOTES: Record<Chime, number[]> = {
  tap: [660],
  send: [740, 988],
  success: [523, 659, 784],
  unlock: [523, 659, 784, 1047],
};

let ctx: AudioContext | null = null;

export function chime(kind: Chime = "tap") {
  if (!on("vs_sounds")) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    NOTES[kind].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.075;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.34);
    });
  } catch {
    /* audio unavailable */
  }
}

/** Combined feel-good feedback for a completed action. */
export function celebrate() {
  haptic([10, 40, 18]);
  chime("success");
}

export function tapped() {
  haptic(8);
  chime("tap");
}

export function sent() {
  haptic(10);
  chime("send");
}

export function unlocked() {
  haptic([12, 50, 12, 50, 20]);
  chime("unlock");
}
