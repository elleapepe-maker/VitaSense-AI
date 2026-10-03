import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — VitaSense AI" },
      { name: "description", content: "Set a new password for your VitaSense AI account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash on load and emits PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // If the user opens the page directly with an existing session, allow it.
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Please use at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated 💗");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl gradient-pink flex items-center justify-center soft-shadow mx-auto">
            <Heart className="w-7 h-7 text-white" fill="white" />
          </div>
          <div className="font-display text-lg font-bold text-gradient-pink mt-3">VitaSense AI</div>
          <h1 className="font-display text-3xl font-bold mt-1">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure link verified from your email
          </p>
        </div>

        <div className="glass-card p-6">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Open this page from the reset link in your email. If you're already here from the link and this message stays, please request a new one.
            </p>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">New password</label>
                <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Confirm password</label>
                <input required type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full rounded-2xl gradient-pink py-3 font-semibold soft-shadow disabled:opacity-60">
                {saving ? "Saving..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
