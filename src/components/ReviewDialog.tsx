import { useEffect, useState } from "react";
import { Star, X, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const STATE_KEY = "vs_rate_state"; // "submitted" | "later:<ts>"

export function ReviewDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [featureOnHome, setFeatureOnHome] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setBody("");
    }
  }, [open]);

  const later = () => {
    localStorage.setItem(STATE_KEY, `later:${Date.now()}`);
    onClose();
  };

  const submit = async () => {
    if (rating === 0) {
      toast.error("Pick a star rating first 🌸");
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        toast.error("Sign in to leave a review 💗");
        setSaving(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_emoji")
        .eq("id", user.id)
        .maybeSingle();
      const displayName =
        profile?.display_name || profile?.username || "A gentle soul";
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        display_name: displayName,
        avatar_emoji: profile?.avatar_emoji ?? "🌸",
        rating,
        body: body.trim() || null,
        feature_on_home: featureOnHome,
      });
      if (error) throw error;
      localStorage.setItem(STATE_KEY, "submitted");
      toast.success("Thank you for the love 💗");
      qc.invalidateQueries({ queryKey: ["public-reviews"] });
      onSubmitted?.();
      onClose();
    } catch (e) {
      toast.error("Couldn't save review. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/70 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg">Rate VitaSense AI</div>
            <div className="text-xs text-muted-foreground">
              Kind words (4★ or 5★ with text) may appear on our home page.
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1 my-4">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover || rating) >= n;
            return (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1 transition hover:scale-110"
                aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-8 h-8 ${filled ? "text-primary" : "text-muted-foreground/40"}`}
                  fill={filled ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a little review (optional)..."
          rows={3}
          maxLength={500}
          className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
        />

        <label className="flex items-center gap-2 mt-3 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={featureOnHome}
            onChange={(e) => setFeatureOnHome(e.target.checked)}
            className="w-4 h-4 rounded accent-pink-400"
          />
          Feature my review on the VitaSense home page (4★+ with text)
        </label>


        <div className="flex gap-2 mt-4">
          <button
            onClick={later}
            disabled={saving}
            className="flex-1 rounded-2xl bg-white/70 border border-white py-2.5 font-semibold text-sm hover:bg-white transition disabled:opacity-50"
          >
            Maybe later
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-2xl gradient-pink py-2.5 font-semibold text-sm soft-shadow hover:scale-[1.02] transition disabled:opacity-50"
          >
            {saving ? "Sending…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
