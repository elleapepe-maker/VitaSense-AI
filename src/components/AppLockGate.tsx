import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { checkPin, hasPin, isUnlocked, unlock } from "@/lib/applock";
import { tapped } from "@/lib/feedback";

export function AppLockGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setNeedsPin(hasPin() && !isUnlocked());
    setReady(true);
  }, []);

  const submit = async (value: string) => {
    if (await checkPin(value)) {
      unlock();
      setNeedsPin(false);
      tapped();
    } else {
      setWrong(true);
      setPin("");
      setTimeout(() => setWrong(false), 1200);
    }
  };

  if (!ready) return null;
  if (!needsPin) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="glass-card p-8 w-full max-w-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl gradient-pink mx-auto flex items-center justify-center soft-shadow">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">Your journal is locked</h1>
          <p className="text-sm text-muted-foreground">Enter your 4-digit code to open VitaSense.</p>
        </div>
        <input
          autoFocus
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
            if (v.length === 4) void submit(v);
          }}
          inputMode="numeric"
          type="password"
          placeholder="••••"
          className={`w-full rounded-2xl border bg-white/80 px-4 py-4 text-center text-xl tracking-[0.6em] outline-none focus:ring-2 focus:ring-primary/40 ${wrong ? "border-destructive" : "border-border"}`}
        />
        {wrong && <p className="text-xs text-destructive">That code didn't match — try again.</p>}
        <p className="text-[11px] text-muted-foreground">
          Your code is checked right here on your device and never sent anywhere.
        </p>
      </div>
    </div>
  );
}
