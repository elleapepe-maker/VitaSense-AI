import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { generateWeeklyReport, getLatestWeeklyReport } from "@/lib/haven.functions";
import { ShareCard } from "@/components/ShareCard";

export const Route = createFileRoute("/_authenticated/weekly-glow")({
  component: WeeklyGlow,
});

function WeeklyGlow() {
  const [report, setReport] = useState<{ summary: string; week_start?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const loadLatest = useServerFn(getLatestWeeklyReport);
  const doGenerate = useServerFn(generateWeeklyReport);

  useEffect(() => {
    (async () => {
      try {
        const r = await loadLatest({});
        if (r.report) setReport(r.report);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadLatest]);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await doGenerate({});
      setReport({ summary: r.summary, week_start: r.weekStart });
      toast.success("Fresh glow report ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pt-4 space-y-5 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Weekly Glow Report ✨</h1>
        <p className="text-sm text-muted-foreground">Haven💫 gathers your week — your moods, your notes, what helped — and reflects it back.</p>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
      ) : report ? (
        <>
          <div className="glass-card p-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your reflection</div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{report.summary}</ReactMarkdown>
            </div>
            <button onClick={generate} disabled={generating} className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${generating ? "animate-spin" : ""}`} /> Regenerate
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Share your glow</div>
            <ShareCard
              title="Weekly Glow"
              headline="I showed up for myself this week 💗"
              subline="One more week, one more layer of care."
              emoji="✨"
              filename="vitasense-weekly-glow"
            />
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="text-5xl">🪞</div>
          <div className="font-display text-xl font-bold">No report yet</div>
          <p className="text-sm text-muted-foreground">Generate your first weekly reflection — it's built from your check-ins, mood notes, and what Haven remembers.</p>
          <button onClick={generate} disabled={generating} className="inline-flex items-center gap-2 rounded-2xl gradient-pink text-white font-semibold px-6 py-3 soft-shadow disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {generating ? "Reflecting..." : "Generate my glow report"}
          </button>
        </div>
      )}
    </div>
  );
}
