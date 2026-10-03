import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateDailyPlan } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coach")({
  component: Coach,
});

function Coach() {
  const run = useServerFn(generateDailyPlan);
  const [profile, setProfile] = useState<{ name: string | null; hobbies: string[]; activities: string[]; routine: string | null; gender: string | null } | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: p } = await supabase.from("profiles").select("display_name, hobbies, activities, daily_routine, gender").eq("id", u.user!.id).maybeSingle();
      setProfile({
        name: p?.display_name ?? null,
        hobbies: p?.hobbies ?? [],
        activities: p?.activities ?? [],
        routine: p?.daily_routine ?? null,
        gender: p?.gender ?? null,
      });
    })();
  }, []);

  const generate = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await run({
        data: {
          vitals: null,
          profile,
        },
      });
      setPlan(result.plan);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Wellness coach</h1>
        <p className="text-sm text-muted-foreground">A gentle plan just for you.</p>
      </div>

      {!plan ? (
        <div className="glass-card p-6 text-center">
          <div className="w-14 h-14 rounded-3xl gradient-lavender mx-auto flex items-center justify-center soft-shadow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold mt-3">Get today's plan</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Personalized with your hobbies, activities, and daily routine.
          </p>
          <button onClick={generate} disabled={loading || !profile}
            className="mt-5 rounded-full gradient-pink px-7 py-3 font-semibold soft-shadow disabled:opacity-50">
            {loading ? "Crafting your plan..." : "Generate plan ✨"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="glass-card p-5">
            <div className="text-sm whitespace-pre-line leading-relaxed">{plan}</div>
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full rounded-2xl py-3 font-semibold bg-white/70 border border-white">
            {loading ? "..." : "Regenerate"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="glass-card p-4">
          <div className="text-2xl mb-1">💧</div>
          <div className="text-xs font-semibold text-muted-foreground">Hydration goal</div>
          <div className="font-display text-2xl font-bold">8 <span className="text-sm font-sans text-muted-foreground">glasses</span></div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl mb-1">😴</div>
          <div className="text-xs font-semibold text-muted-foreground">Sleep target</div>
          <div className="font-display text-2xl font-bold">8 <span className="text-sm font-sans text-muted-foreground">hours</span></div>
        </div>
      </div>
    </div>
  );
}
