import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();

  useEffect(() => {
    // Nudge the subscription hook to refresh once webhook lands.
    const t = setTimeout(() => {
      window.dispatchEvent(new Event("vitasense:subscription-refresh"));
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl gradient-pink flex items-center justify-center soft-shadow mx-auto">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mt-4 text-gradient-pink">
          {session_id ? "Welcome to Premium ✨" : "Checkout"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {session_id
            ? "Your subscription is being activated. Premium features will unlock in a moment."
            : "No checkout session information found."}
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-6 rounded-2xl gradient-pink text-white font-display font-bold px-6 py-3 soft-shadow"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
