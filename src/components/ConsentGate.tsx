import { useEffect, useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { tapped } from "@/lib/feedback";

const key = (id: string) => `vs_terms_accepted_${id}`;

export function ConsentGate({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAccepted(localStorage.getItem(key(user.id)) === "1");
  }, [user]);

  if (!user || accepted === null) return null;
  if (accepted) return <>{children}</>;

  const agree = () => {
    localStorage.setItem(key(user.id), "1");
    localStorage.setItem(`vs_terms_accepted_at_${user.id}`, new Date().toISOString());
    tapped();
    setAccepted(true);
  };

  const declineAndLeave = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="glass-card p-8 w-full max-w-md space-y-5">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl gradient-pink mx-auto flex items-center justify-center soft-shadow">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">One quick thing 💗</h1>
          <p className="text-sm text-muted-foreground">
            Before you start, please read and agree to our Terms &amp; Conditions and Privacy Policy.
            Your check-ins, journal notes and Haven💫 chats stay private to your account.
          </p>
        </div>

        <div className="flex gap-3 justify-center text-sm font-semibold">
          <Link to="/terms" className="rounded-full bg-white/70 border border-white px-4 py-2 hover:bg-white transition">
            Terms &amp; Conditions
          </Link>
          <Link to="/privacy" className="rounded-full bg-white/70 border border-white px-4 py-2 hover:bg-white transition">
            Privacy Policy
          </Link>
        </div>

        <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary rounded"
          />
          <span>I have read and agree to the Terms &amp; Conditions and the Privacy Policy.</span>
        </label>

        <button
          onClick={agree}
          disabled={!checked}
          className="w-full rounded-2xl gradient-pink py-3 font-semibold text-white soft-shadow disabled:opacity-50 hover:scale-[1.01] transition"
        >
          Agree and continue
        </button>
        <button
          onClick={declineAndLeave}
          className="w-full text-xs text-muted-foreground hover:text-primary transition"
        >
          Not right now — sign me out
        </button>
      </div>
    </div>
  );
}
