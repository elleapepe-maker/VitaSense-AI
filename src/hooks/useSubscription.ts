import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { isCreator } from "@/lib/creator";

export type SubscriptionRow = {
  id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSubscription(null); setLoading(false); return; }

    // The creator always has premium access without needing a Stripe subscription.
    if (isCreator(u.user.email)) {
      setSubscription({
        id: "creator",
        status: "active",
        price_id: "creator",
        current_period_end: null,
        cancel_at_period_end: false,
        stripe_customer_id: "creator",
      });
      setLoading(false);
      return;
    }

    let env: "sandbox" | "live";
    try { env = getStripeEnvironment(); } catch { setSubscription(null); setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions")
      .select("id, status, price_id, current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", u.user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as SubscriptionRow) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("vitasense:subscription-refresh", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("vitasense:subscription-refresh", onFocus);
    };
  }, []);

  const isActive = !!subscription && (
    (["active", "trialing", "past_due"].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())) ||
    (subscription.status === "canceled" && subscription.current_period_end &&
      new Date(subscription.current_period_end) > new Date())
  );

  return { subscription, isActive, loading, refresh: load };
}
