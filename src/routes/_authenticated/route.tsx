import { createFileRoute, Outlet, redirect, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Heart, Star, Smile, LogOut, User, Flower2, Users, Car, Shield, Zap, Activity, Trophy, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RateAppPrompt } from "@/components/RateAppPrompt";
import { HelpGuideButton } from "@/components/HelpGuide";
import { ReviewStarButton } from "@/components/ReviewStarButton";
import { NotificationBell } from "@/components/NotificationBell";

import { ThemeProvider, useTheme } from "@/lib/theme";
import { PremiumButton } from "@/components/PremiumButton";
import { PremiumPrompt } from "@/components/PremiumPrompt";
import { PanicButton } from "@/components/PanicButton";
import { PreEventCheckIn } from "@/components/PreEventCheckIn";
import { RatingsNotice } from "@/components/RatingsNotice";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { AppLockGate } from "@/components/AppLockGate";
import { ConsentGate } from "@/components/ConsentGate";



export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Honor "Remember me": if the user opted out and this is a fresh
    // browser session (no sessionStorage flag), sign them out.
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("vs_remember_me") !== "0";
      const alive = sessionStorage.getItem("vs_session_alive") === "1";
      if (!remembered && !alive) {
        await supabase.auth.signOut().catch(() => {});
        throw redirect({ to: "/auth" });
      }
      sessionStorage.setItem("vs_session_alive", "1");
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthLayout,
});

const feminineTabs = [
  { to: "/dashboard", label: "Home", icon: Heart },
  { to: "/chat", label: "Haven💫", icon: Star },
  { to: "/mood", label: "Mood", icon: Smile },
  { to: "/history", label: "Journey", icon: Flower2 },
  { to: "/messages", label: "Messages", icon: MessageCircle },
] as const;

const masculineTabs = [
  { to: "/dashboard", label: "Home", icon: Shield },
  { to: "/chat", label: "Haven💫", icon: Zap },
  { to: "/mood", label: "Mood", icon: Activity },
  { to: "/history", label: "Journey", icon: Car },
  { to: "/messages", label: "Messages", icon: MessageCircle },
] as const;

function AuthLayout() {
  return (
    <AppLockGate>
      <ConsentGate>
        <ThemeProvider>
          <AuthLayoutInner />
        </ThemeProvider>
      </ConsentGate>
    </AppLockGate>
  );
}

function AuthLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme } = useTheme();
  const masc = theme === "masculine";
  const unread = useUnreadMessages();

  const tabs = masc ? masculineTabs : feminineTabs;
  const BrandIcon = masc ? Trophy : Heart;


  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success(theme === "masculine" ? "See you soon 🚗" : "See you soon 🌸");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="max-w-3xl mx-auto flex items-center justify-between px-5 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <BrandIcon className="w-5 h-5 text-white" fill={masc ? "none" : "white"} />
          </div>
          <span className="font-display font-bold text-lg">VitaSense AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <HelpGuideButton />
          <PremiumButton />
          <ReviewStarButton />
          <Link to="/friends" className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition" aria-label="Friends">
            <Users className="w-4 h-4" />
          </Link>
          <NotificationBell />
          <Link to="/profile" className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition" aria-label="Profile">
            <User className="w-4 h-4" />
          </Link>
          <button onClick={signOut} className="rounded-full p-2 bg-white/70 border border-white hover:bg-white transition" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>

      <main className="max-w-3xl mx-auto px-5">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
        <div className="glass-card px-2 py-2 flex items-center justify-between">
          {tabs.map((t) => {
            const active = location.pathname.startsWith(t.to);
            const showBadge = t.to === "/messages" && unread > 0;
            return (
              <Link
                key={t.to} to={t.to}
                className={`relative flex-1 flex flex-col items-center gap-0.5 rounded-2xl py-2 px-1 transition ${active ? "gradient-pink text-white soft-shadow" : "text-muted-foreground hover:text-primary"}`}
              >
                <span className="relative">
                  <t.icon className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full gradient-pink text-[10px] font-bold flex items-center justify-center text-white border border-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <RateAppPrompt />
      <PremiumPrompt />
      <PreEventCheckIn />
      <PanicButton />
      <RatingsNotice />


    </div>
  );
}

