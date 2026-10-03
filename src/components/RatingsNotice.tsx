import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SEEN_KEY = "vs_ratings_seen_total";
const LAST_TOAST_KEY = "vs_ratings_last_toast";
const TOAST_COOLDOWN = 1000 * 60 * 60 * 6; // 6 hours

/** Shows a gentle notification about how many ratings the app has. */
export function RatingsNotice() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase.rpc("review_stats");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row || cancelled) return;

      const total = Number(row.total ?? 0);
      const average = Number(row.average ?? 0);
      if (total === 0) return;

      const seen = Number(localStorage.getItem(SEEN_KEY) ?? "0");
      const lastToast = Number(localStorage.getItem(LAST_TOAST_KEY) ?? "0");
      const isNew = total > seen;
      if (!isNew && Date.now() - lastToast < TOAST_COOLDOWN) return;

      const newOnes = total - seen;
      setTimeout(() => {
        toast(
          isNew && seen > 0
            ? `${newOnes} new ${newOnes === 1 ? "rating" : "ratings"} just came in ⭐`
            : `VitaSense AI has ${total} ${total === 1 ? "rating" : "ratings"} ⭐`,
          {
            description: `${average.toFixed(1)} average out of 5 — thank you for the love 💗`,
            duration: 6000,
          },
        );
        localStorage.setItem(SEEN_KEY, String(total));
        localStorage.setItem(LAST_TOAST_KEY, String(Date.now()));
      }, 2500);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
