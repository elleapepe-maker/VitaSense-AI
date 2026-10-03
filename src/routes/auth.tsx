import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — VitaSense AI" },
      { name: "description", content: "Sign in or create your VitaSense AI account to start your gentle wellness journey with Haven💫." },
    ],
  }),
  component: AuthPage,
});

const REMEMBER_KEY = "vs_remember_me";
const SESSION_ALIVE_KEY = "vs_session_alive";



function AuthPage() {
  const navigate = useNavigate();
  // "login" = existing users, "signup" = new users (per user preference)
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY) !== "0";
    setRemember(remembered);
    const alive = sessionStorage.getItem(SESSION_ALIVE_KEY) === "1";
    if (!remembered && !alive) {
      supabase.auth.signOut().catch(() => {});
      return;
    }
    sessionStorage.setItem(SESSION_ALIVE_KEY, "1");
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Persist the remember-me choice and mark this tab session alive
      // so a new tab/browser restart signs the user out when remember=off.
      localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
      sessionStorage.setItem(SESSION_ALIVE_KEY, "1");


      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Let's set up your profile 🌸");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back 💗");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!email) return toast.error("Type your email above first, then tap 'Forgot password?' again.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Check your email for a secure reset link 💌");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-14 h-14 rounded-3xl gradient-pink flex items-center justify-center soft-shadow">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
          </div>
          <div className="font-display text-lg font-bold text-gradient-pink">VitaSense AI</div>
          <h1 className="font-display text-3xl font-bold mt-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup"
              ? "New here? Just a few details to get you started."
              : "Log in to your VitaSense AI space."}
          </p>
        </div>

        <div className="glass-card p-6">
          {/* Mode toggle up top so it's obvious which one to pick */}
          <div className="flex bg-white/60 rounded-2xl p-1 mb-5">
            <button type="button" onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === "login" ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>
              Log in
            </button>
            <button type="button" onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === "signup" ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>
              Sign up
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground -mt-3 mb-4 text-center">
            {mode === "login" ? "Already have an account? You're in the right spot." : "New to VitaSense AI? Create your account here."}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Your name</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email</label>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <input
                required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              Remember me on this device
            </label>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-2xl gradient-pink py-3 font-semibold soft-shadow disabled:opacity-60 hover:scale-[1.01] transition"
            >
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            </button>

            {mode === "login" && (
              <button type="button" onClick={forgotPassword}
                className="w-full text-xs text-muted-foreground hover:text-primary transition">
                Forgot password? Send me a secure reset link 💌
              </button>
            )}
          </form>

          <div className="mt-4 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
            🔒 Your journal entries and check-ins stay private to your account.
          </div>

          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-primary transition"
          >
            {mode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
