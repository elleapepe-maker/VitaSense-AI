import { useState } from "react";
import { Sparkles, Check, X, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthUser } from "@/hooks/useAuthUser";
import { isCreator } from "@/lib/creator";
import { StripeEmbeddedCheckout } from "./StripeEmbeddedCheckout";
import { PREMIUM_PRICE_ID } from "@/lib/premium";

const FEATURES = [
  "Unlimited Haven💫 chat messages",
  "Deeper AI wellness insights",
  "Personalized wellness plans",
  "Advanced mood analytics",
  "Exclusive premium themes",
  "Priority feature access",
];

export function PremiumDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isActive, subscription } = useSubscription();
  const user = useAuthUser();
  const creator = isCreator(user?.email);
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const startCheckout = () => {
    setError(null);
    try {
      setCheckout(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is not available right now.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-md relative my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <button
          onClick={() => { setCheckout(false); onClose(); }}
          className="absolute top-3 right-3 rounded-full p-1.5 bg-white/70 border border-white hover:bg-white z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-gradient-pink">VitaSense Premium</div>
              <div className="text-xs text-muted-foreground">
                {isActive ? (creator ? "Creator access — all features unlocked" : "Your premium is active 💗") : "$4.99 / month — cancel anytime"}
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl gradient-mint p-4">
                <div className="flex items-center gap-2 font-display font-bold">
                  <Sparkles className="w-4 h-4" /> Premium unlocked 💗
                </div>
                <p className="text-xs mt-1 opacity-80">
                  {creator
                    ? "Thank you for creating VitaSense AI. All premium features are unlocked for you."
                    : "Thank you for supporting VitaSense AI. Haven💫 chats are unlimited for you."}
                  {subscription?.cancel_at_period_end && subscription.current_period_end &&
                    ` Access ends ${new Date(subscription.current_period_end).toLocaleDateString()}.`}
                </p>
              </div>
              <ul className="space-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : checkout ? (
            <div className="mt-4">
              <StripeEmbeddedCheckout
                priceId={PREMIUM_PRICE_ID}
                customerEmail={user?.email ?? undefined}
                userId={user?.id}
                returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <ul className="space-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                onClick={startCheckout}
                className="w-full rounded-2xl gradient-pink text-white font-display font-bold py-3 soft-shadow"
              >
                Unlock Premium — $4.99/mo
              </button>
              <p className="text-[11px] text-center text-muted-foreground">
                The free version keeps mood check-ins, daily quotes and Haven💫 chat (25 messages a day).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
