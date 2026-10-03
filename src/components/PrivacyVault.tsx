import { useEffect, useState } from "react";
import { ShieldCheck, Lock, KeyRound, EyeOff, Server, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { hasPin, setPin, clearPin, lockNow } from "@/lib/applock";
import { tapped, celebrate } from "@/lib/feedback";

const BADGES = [
  {
    icon: Lock,
    title: "Encrypted in transit",
    body: "Every request to VitaSense travels over HTTPS/TLS, so nothing you write can be read on the way.",
  },
  {
    icon: Server,
    title: "Row-level protection",
    body: "The database only ever returns rows that belong to your account — your journal is invisible to other users.",
  },
  {
    icon: EyeOff,
    title: "Private by default",
    body: "Your check-ins, symptoms and Haven💫 chats are never shown publicly. Only ratings you choose to post are public.",
  },
  {
    icon: KeyRound,
    title: "Client-side app PIN",
    body: "Your PIN is hashed with SHA-256 and a random salt on your own device. It never reaches our servers.",
  },
  {
    icon: ShieldCheck,
    title: "Password-protected reports",
    body: "Counselor reports can be locked with a password before they ever leave your phone.",
  },
  {
    icon: Trash2,
    title: "You can erase everything",
    body: "Download all your data, or delete your account and every entry with it, whenever you want.",
  },
];

export function PrivacyVault() {
  const [locked, setLocked] = useState(false);
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setLocked(hasPin()), []);

  const save = async () => {
    if (!/^\d{4}$/.test(pin1)) return toast.error("Pick a 4-digit code");
    if (pin1 !== pin2) return toast.error("The two codes don't match");
    setBusy(true);
    try {
      await setPin(pin1);
      setLocked(true);
      setPin1("");
      setPin2("");
      celebrate();
      toast.success("App lock is on 🔒");
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    clearPin();
    setLocked(false);
    tapped();
    toast.success("App lock turned off");
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h2 className="font-display font-bold text-lg">Privacy & Security Vault</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Privacy is a human right. Here's exactly how your words are kept safe.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {BADGES.map((b) => (
          <div key={b.title} className="rounded-2xl border border-border bg-white/60 p-3 flex gap-3">
            <span className="w-9 h-9 rounded-xl gradient-lavender flex items-center justify-center shrink-0">
              <b.icon className="w-4 h-4" />
            </span>
            <span>
              <span className="block font-semibold text-sm flex items-center gap-1">
                {b.title} <CheckCircle2 className="w-3 h-3 text-primary" />
              </span>
              <span className="block text-[11px] text-muted-foreground">{b.body}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white/60 p-4 space-y-3">
        <div className="font-semibold text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> App lock code
        </div>
        {locked ? (
          <>
            <p className="text-xs text-muted-foreground">
              Your app is locked with a 4-digit code. If someone grabs your phone, they can't read your journal.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  lockNow();
                  window.location.reload();
                }}
                className="rounded-2xl py-2 text-sm font-semibold gradient-pink text-white soft-shadow"
              >
                Lock now
              </button>
              <button onClick={remove} className="rounded-2xl py-2 text-sm font-semibold bg-white/70 border border-white">
                Turn off lock
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Set a 4-digit code that's asked for every time you open VitaSense on this device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={pin1}
                onChange={(e) => setPin1(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                type="password"
                placeholder="New code"
                className="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-center tracking-[0.4em]"
              />
              <input
                value={pin2}
                onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                type="password"
                placeholder="Repeat"
                className="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-center tracking-[0.4em]"
              />
            </div>
            <button
              onClick={save}
              disabled={busy}
              className="w-full rounded-2xl py-3 font-semibold gradient-pink text-white soft-shadow disabled:opacity-60"
            >
              {busy ? "Saving…" : "Turn on app lock"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              Only this device knows the code — we can't recover it, so pick something you'll remember.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
