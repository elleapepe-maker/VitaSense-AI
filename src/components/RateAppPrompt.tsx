import { useEffect, useState } from "react";
import { ReviewDialog } from "./ReviewDialog";

const VISIT_KEY = "vs_rate_visits";
const STATE_KEY = "vs_rate_state"; // "submitted" | "later:<timestamp>"

const SHOW_AFTER_VISITS = 3;
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 3;

export function RateAppPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = localStorage.getItem(STATE_KEY) ?? "";
    if (state === "submitted") return;
    if (state.startsWith("later:")) {
      const ts = Number(state.slice(6));
      if (Date.now() - ts < SNOOZE_MS) return;
    }
    const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));
    if (visits >= SHOW_AFTER_VISITS) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  return <ReviewDialog open={open} onClose={() => setOpen(false)} />;
}
