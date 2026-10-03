import { useEffect, useState } from "react";
import { PremiumDialog } from "./PremiumDialog";
import { useSubscription } from "@/hooks/useSubscription";

const KEY = "vitasense:premium-prompt-shown";

export function PremiumPrompt() {
  const [open, setOpen] = useState(false);
  const { isActive, loading } = useSubscription();

  useEffect(() => {
    if (loading || isActive) return;
    if (typeof window === "undefined") return;
    const last = Number(window.localStorage.getItem(KEY) || 0);
    const now = Date.now();
    // Show once, then again at most every 3 days
    if (now - last < 1000 * 60 * 60 * 24 * 3) return;
    const t = setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(KEY, String(now));
    }, 20000); // 20s after landing in the app
    return () => clearTimeout(t);
  }, [loading, isActive]);

  return <PremiumDialog open={open} onClose={() => setOpen(false)} />;
}
