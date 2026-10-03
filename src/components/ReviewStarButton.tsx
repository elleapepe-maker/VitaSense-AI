import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ReviewDialog } from "./ReviewDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const REMIND_KEY = "vs_rate_last_reminder";
const STATE_KEY = "vs_rate_state";
const REMINDER_INTERVAL = 1000 * 60 * 60 * 24 * 3; // 3 days

export function ReviewStarButton() {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const loadTotal = () => {
    supabase.rpc("review_stats").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setTotal(Number(row.total ?? 0));
    });
  };

  useEffect(() => {
    loadTotal();
    if (typeof window === "undefined") return;
    const state = localStorage.getItem(STATE_KEY) ?? "";
    if (state === "submitted") return;
    const last = Number(localStorage.getItem(REMIND_KEY) ?? "0");
    if (Date.now() - last < REMINDER_INTERVAL) return;
    const t = setTimeout(() => {
      toast("Loving VitaSense AI? ⭐", {
        description: "Tap the star up top to leave a quick review.",
        duration: 6000,
      });
      localStorage.setItem(REMIND_KEY, String(Date.now()));
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 rounded-full px-2.5 py-2 bg-white/70 border border-white hover:bg-white transition"
        aria-label={total ? `Rate & review — ${total} ratings so far` : "Rate & review the app"}
        title={total ? `${total} ratings so far` : "Rate & review"}
      >
        <Star className="w-4 h-4 text-primary" fill="currentColor" />
        {total !== null && total > 0 && (
          <span className="text-[11px] font-bold text-primary">{total}</span>
        )}
      </button>
      <ReviewDialog open={open} onClose={() => setOpen(false)} onSubmitted={loadTotal} />
    </>
  );
}

