import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BarChart3, Sparkles, MessageCircle, Heart, TrendingUp, Wind } from "lucide-react";
import { getAppStats } from "@/lib/stats.functions";

const statsQuery = queryOptions({
  queryKey: ["app-stats"],
  queryFn: () => getAppStats(),
});

export const Route = createFileRoute("/stats")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: StatsPage,
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Our numbers are catching their breath — try again in a moment.
    </div>
  ),
  notFoundComponent: () => <div className="min-h-screen flex items-center justify-center">Not found</div>,
  head: () => ({
    meta: [
      { title: "VitaSense AI Impact Stats — real usage & mood data" },
      {
        name: "description",
        content:
          "Live, anonymous numbers from VitaSense AI: total wellness check-ins, Haven💫 messages processed, grounding rituals completed, and average mood improvement across all users.",
      },
      { property: "og:title", content: "VitaSense AI Impact Stats" },
      {
        property: "og:description",
        content: "Live anonymous impact numbers from VitaSense AI — check-ins, Haven messages, rituals and mood improvement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function n(v: number | null | undefined) {
  return (v ?? 0).toLocaleString();
}

function StatsPage() {
  const { data } = useSuspenseQuery(statsQuery);

  const improvement =
    data.first_week_mood > 0 && data.later_week_mood > 0
      ? Math.round(((data.later_week_mood - data.first_week_mood) / data.first_week_mood) * 1000) / 10
      : null;

  const trend = data.mood_trend ?? [];
  const maxScore = 10;

  const tiles: { label: string; value: string; icon: typeof Heart }[] = [
    { label: "Wellness check-ins logged", value: n(data.daily_checkins + data.mood_checkins), icon: Heart },
    { label: "Messages processed by Haven💫", value: n(data.haven_messages), icon: MessageCircle },
    { label: "Grounding rituals completed", value: n(data.rituals_completed), icon: Wind },
    { label: "Things Haven💫 remembers", value: n(data.haven_memories), icon: Sparkles },
    { label: "Symptom conversations", value: n(data.symptom_sessions), icon: BarChart3 },
    { label: "People using VitaSense", value: n(data.users), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-pink mx-auto flex items-center justify-center soft-shadow">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold">VitaSense AI by the numbers 📈</h1>
          <p className="text-sm text-muted-foreground">
            Live totals across everyone using the app. Fully anonymous — no names, no entries, just counts.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className="glass-card p-4">
              <t.icon className="w-4 h-4 text-primary mb-2" />
              <div className="font-display font-bold text-2xl">{t.value}</div>
              <div className="text-[11px] text-muted-foreground">{t.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="font-display font-bold text-lg">Average mood improvement</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/70 p-3">
              <div className="text-[11px] text-muted-foreground">First week</div>
              <div className="font-display font-bold text-xl">{data.first_week_mood || "—"}</div>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <div className="text-[11px] text-muted-foreground">After week 1</div>
              <div className="font-display font-bold text-xl">{data.later_week_mood || "—"}</div>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <div className="text-[11px] text-muted-foreground">Change</div>
              <div className="font-display font-bold text-xl">
                {improvement === null ? "—" : `${improvement > 0 ? "+" : ""}${improvement}%`}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Wellness scores are self-reported on a 0–10 scale. We compare each person's first seven days with everything
            after, then average across all users.
          </p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="font-display font-bold text-lg">Daily average wellness score (last 30 days)</div>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-ins in the last 30 days yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {trend.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col justify-end items-center gap-1" title={`${d.day}: ${d.score}/10 from ${d.checkins} check-in(s)`}>
                  <div
                    className="w-full rounded-t-lg gradient-pink"
                    style={{ height: `${Math.max(4, (Number(d.score) / maxScore) * 100)}%` }}
                  />
                  <div className="text-[8px] text-muted-foreground">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5 grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-[11px] text-muted-foreground">Average rating</div>
            <div className="font-display font-bold text-2xl">{data.avg_rating || "—"} ⭐</div>
            <div className="text-[11px] text-muted-foreground">{n(data.reviews)} ratings</div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">Average anxiety score</div>
            <div className="font-display font-bold text-2xl">{data.avg_anxiety || "—"}/10</div>
            <div className="text-[11px] text-muted-foreground">from anxiety quizzes</div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground space-x-2">
          <Link to="/" className="text-primary underline">Home</Link>
          <span>·</span>
          <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="text-primary underline">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  );
}
