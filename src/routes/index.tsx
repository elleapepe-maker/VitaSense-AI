import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles, MessageCircle, Brain, ShieldCheck, AlertCircle, Lightbulb, Target, Lock, Flame, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HelpGuideButton } from "@/components/HelpGuide";
import { CommunityReviews } from "@/components/CommunityReviews";
import { WelcomeIntro } from "@/components/WelcomeIntro";


export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("vs_remember_me") !== "0";
    const alive = sessionStorage.getItem("vs_session_alive") === "1";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSignedIn(true);
        // Auto-take remembered users straight to their dashboard.
        if (remembered || alive) {
          sessionStorage.setItem("vs_session_alive", "1");
          window.location.replace("/dashboard");
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen">
      <WelcomeIntro />
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl">VitaSense AI</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpGuideButton />
          <Link to={signedIn ? "/dashboard" : "/auth"} className="rounded-full px-5 py-2 text-sm font-semibold bg-white/70 backdrop-blur border border-white hover:bg-white transition">
            {signedIn ? "Open app" : "Log in"}
          </Link>
        </div>
      </header>


      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary border border-white mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered wellness
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] font-bold">
            VitaSense AI<br />
            <span className="text-gradient-pink">know your health.</span><br />
            <span className="text-gradient-pink">Improve your life.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-md">
            VitaSense AI pairs a gentle AI wellness companion with mood, symptom, and Haven💫 chat check-ins — all in one soft little space.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <Link to="/auth" className="rounded-full gradient-pink px-7 py-3 font-semibold soft-shadow hover:scale-105 transition">
              Create your account
            </Link>
            <Link to="/demo" className="rounded-full px-7 py-3 font-semibold bg-white/80 border border-white backdrop-blur inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Try the demo
            </Link>
            <Link to="/auth" className="rounded-full px-7 py-3 font-semibold bg-white/80 border border-white backdrop-blur">
              Sign in
            </Link>
          </div>


          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-foreground/70 border border-white">
            <Lock className="w-3.5 h-3.5" /> Your journal entries stay private
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: MessageCircle, label: "Haven Chat💫", tint: "gradient-mint" },
              { icon: Brain, label: "AI symptom checker", tint: "gradient-lavender" },
              { icon: Heart, label: "Mood check-ins", tint: "gradient-pink" },
              { icon: ShieldCheck, label: "Gentle guidance", tint: "gradient-butter" },
            ].map((f) => (
              <div key={f.label} className="glass-card p-4 flex items-center gap-3">
                <div className={`${f.tint} w-9 h-9 rounded-xl flex items-center justify-center`}>
                  <f.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full gradient-pink opacity-40 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full gradient-lavender opacity-40 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl gradient-pink flex items-center justify-center soft-shadow mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Your safe corner</div>
              <div className="font-display text-3xl font-bold mb-4">Haven💫</div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-5">
                Vent, celebrate, or just talk. No judgement, no pressure — only warm, gentle support whenever you need it.
              </p>
              <div className="w-full p-4 rounded-2xl gradient-lavender">
                <div className="text-xs opacity-80 mb-1">💬 A gentle check-in</div>
                <div className="text-sm font-medium">"Hi friend, what's on your mind today? I'm here to listen."</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution / Goal */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="glass-card p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-pink opacity-30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center soft-shadow mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">The problem</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you feel anxious, low, or off — most apps hand you cold charts, generic tips, or a chatbot that sounds like a form. There's rarely a soft, private place to just <em>be heard</em>, check in with your body, and get gentle guidance made for you.
              </p>
            </div>
          </div>

          <div className="glass-card p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-lavender opacity-30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-lavender flex items-center justify-center soft-shadow mb-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Our solution</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                VitaSense AI pairs a gentle AI wellness companion with Haven💫 — a warm, judgement-free chat you can vent to anytime — plus symptom check-ins and mood quizzes, all in one calm space with personalized tips that meet you where you are today.
              </p>
            </div>
          </div>

          <div className="glass-card p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-mint opacity-30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-mint flex items-center justify-center soft-shadow mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Our goal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To help you truly know your body — and make small, kind choices every day that add up to a healthier, happier life. No shame, no scary charts, just softly smart guidance you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Friends & streaks */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary border border-white mb-4">
            <Users className="w-3.5 h-3.5" /> Friends & shared streaks
          </div>
          <h2 className="font-display text-4xl font-bold">
            Grow gentler, <span className="text-gradient-pink">together.</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Add friends you trust and keep a shared wellness streak — a little like Duolingo, but for feeling good. Every day you both check in on your mood or complete a wellness task, your streak grows 🔥
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="glass-card p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-pink opacity-30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center soft-shadow mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Friend the people who lift you up</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search by name or @username, send a gentle friend request, and once they accept you can cheer each other on. No public feed, no likes — just soft accountability with your people.
              </p>
            </div>
          </div>

          <div className="glass-card p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-lavender opacity-30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-lavender flex items-center justify-center soft-shadow mb-4">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Shared wellness streaks 🔥</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Complete tiny daily tasks to keep your streak alive with each friend:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-5">
                <li>Drink 8 glasses of water 💧</li>
                <li>Move for 20+ minutes 🌷</li>
                <li>Sleep 7+ hours 🌙</li>
                <li>Do a mood check-in 💭</li>
                <li>Log 3 "Great" days in a row 🌈</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Creator spotlight */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="glass-card p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full gradient-pink opacity-30 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full gradient-lavender opacity-30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-3xl gradient-pink flex items-center justify-center soft-shadow">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">About me</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Ellea Pepe</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              I'm a competitive tennis player — I made the swing team in 6th grade and won every single match — and I'm also a competitive dancer. I started a costume collection drive at my studio so dancers could get the gear they need. I built VitaSense AI because I wanted a soft, judgement-free place where people could feel heard, check in with themselves, and get a little guidance. I brought the same hard work, creativity, and care that I put into dance and tennis into this app, because I truly believe wellness should feel gentle, personal, and supportive.
            </p>
          </div>
        </div>
      </section>


      {/* Loved by many */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary border border-white mb-4">
            <Heart className="w-3.5 h-3.5" fill="currentColor" /> Loved by many
          </div>
          <h2 className="font-display text-4xl font-bold">
            A gentle space <span className="text-gradient-pink">people trust.</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A growing community of gentle souls lean on VitaSense AI to feel a little more calm, cared for, and in tune with themselves.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
          {[
            { n: "🌱", l: "a growing community" },
            { n: "💗", l: "made with care" },
            { n: "✨", l: "always judgement-free" },
          ].map((s) => (
            <div key={s.l} className="glass-card p-5 text-center">
              <div className="font-display text-3xl font-bold">{s.n}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <CommunityReviews />
      </section>


      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 pb-12">

        <div className="glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full gradient-pink opacity-30 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full gradient-lavender opacity-30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl">VitaSense AI</span>
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold">
              Know your <span className="text-gradient-pink">health.</span> Improve your <span className="text-gradient-pink">life.</span>
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary border border-white">
              <Sparkles className="w-3.5 h-3.5" /> AI-powered wellness
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Creator: <span className="font-semibold text-foreground">Ellea Pepe</span> 💗
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> ·{" "}
              <Link to="/terms" className="text-primary underline">Terms & Conditions</Link> ·{" "}
              <Link to="/stats" className="text-primary underline">Impact stats</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}




