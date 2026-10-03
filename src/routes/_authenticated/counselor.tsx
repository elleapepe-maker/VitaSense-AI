import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck, Download, Lock, HeartHandshake } from "lucide-react";
import { getCounselorReport, type CounselorReport } from "@/lib/counselor.functions";
import { celebrate } from "@/lib/feedback";

export const Route = createFileRoute("/_authenticated/counselor")({
  component: CounselorConnection,
  head: () => ({
    meta: [
      { title: "Counselor Connection · VitaSense AI" },
      {
        name: "description",
        content:
          "Turn your last 30 days of mood, anxiety and wellness check-ins into a private, password-protected report you can share with a school counselor or trusted adult.",
      },
      { property: "og:title", content: "Counselor Connection · VitaSense AI" },
      {
        property: "og:description",
        content: "A private 30-day wellness report you choose to share with a counselor or trusted adult.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const SHARE_KEY = "vs_counselor_sharing";

function fmt(v: number | null, suffix = "") {
  return v === null ? "—" : `${v}${suffix}`;
}

function CounselorConnection() {
  const load = useServerFn(getCounselorReport);
  const [report, setReport] = useState<CounselorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(SHARE_KEY) === "1");
    load({ data: undefined } as never)
      .then((r) => setReport(r as CounselorReport))
      .catch(() => toast.error("Couldn't load your trends"))
      .finally(() => setLoading(false));
  }, [load]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(SHARE_KEY, next ? "1" : "0");
  };

  const download = async () => {
    if (!report) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        unit: "pt",
        format: "letter",
        ...(passcode.trim()
          ? { encryption: { userPassword: passcode.trim(), ownerPassword: passcode.trim() } }
          : {}),
      });

      const left = 48;
      let y = 60;

      doc.setFontSize(20);
      doc.text("VitaSense AI — 30-Day Wellness Report", left, y);
      y += 24;
      doc.setFontSize(11);
      doc.setTextColor(110);
      doc.text(
        `Shared by ${report.student_name} · generated ${new Date(report.generated_at).toLocaleString()}`,
        left,
        y,
      );
      y += 16;
      doc.text("Self-reported wellness check-ins. Supportive information, not a medical diagnosis.", left, y);
      y += 30;

      doc.setTextColor(20);
      doc.setFontSize(14);
      doc.text("Summary", left, y);
      y += 18;
      doc.setFontSize(11);
      const rows: [string, string][] = [
        ["Average anxiety score (0–10)", fmt(report.averages.anxiety)],
        ["Anxiety quizzes completed", String(report.anxietyCheckins)],
        ["Days scoring 7 or higher", String(report.highAnxietyDays)],
        ["Last 7 days anxiety average", fmt(report.lastWeekAnxietyAvg)],
        ["Average daily wellness score", fmt(report.averages.moodScore)],
        ["Average sleep", fmt(report.averages.sleep, " hrs")],
        ["Average water", fmt(report.averages.water, " glasses")],
        ["Average movement", fmt(report.averages.exercise, " min")],
        ["Average screen time", fmt(report.averages.screen, " hrs")],
      ];
      for (const [k, v] of rows) {
        doc.text(k, left, y);
        doc.text(v, left + 300, y);
        y += 16;
      }

      y += 18;
      doc.setFontSize(14);
      doc.text("Daily detail", left, y);
      y += 18;
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text("Date        Anxiety   Mood        Score   Sleep   Water   Move   Screen", left, y);
      doc.setTextColor(20);
      y += 14;

      for (const d of report.days) {
        if (y > 730) {
          doc.addPage();
          y = 60;
        }
        const line = [
          d.day,
          fmt(d.anxiety).padStart(7),
          (d.mood ?? "—").padEnd(11).slice(0, 11),
          fmt(d.moodScore).padStart(5),
          fmt(d.sleep).padStart(6),
          fmt(d.water).padStart(6),
          fmt(d.exercise).padStart(5),
          fmt(d.screen).padStart(6),
        ].join("  ");
        doc.text(line, left, y);
        y += 13;
      }

      if (y > 700) {
        doc.addPage();
        y = 60;
      }
      y += 22;
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text(
        "If anything here worries you, please talk with a school counselor or trusted adult. In the US you can call or text 988 anytime.",
        left,
        y,
        { maxWidth: 500 },
      );

      doc.save(`vitasense-wellness-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      celebrate();
      toast.success(passcode.trim() ? "Report saved & password-protected 🔒" : "Report saved 💗");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't build the report");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Counselor Connection 🤝</h1>
        <p className="text-sm text-muted-foreground">
          Nothing here is ever shared automatically. You choose if, when, and with whom.
        </p>
      </div>

      {report?.elevatedWeek && (
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <div className="font-display font-bold text-lg">This week has felt heavy 💗</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your anxiety check-ins have stayed high all week. Would you like to download your 30-day wellness data to
            share with your school counselor or a trusted adult? You never have to do this alone.
          </p>
        </div>
      )}

      <div className="glass-card p-5 space-y-3">
        <button onClick={toggle} className="w-full flex items-center justify-between text-left">
          <div>
            <div className="font-display font-bold">Allow counselor sharing</div>
            <div className="text-xs text-muted-foreground">
              Turns on the download button below. Off by default.
            </div>
          </div>
          <span
            className={`w-12 h-7 rounded-full transition relative ${enabled ? "gradient-pink" : "bg-muted"}`}
            aria-hidden
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${enabled ? "left-6" : "left-1"}`}
            />
          </span>
        </button>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="font-display font-bold text-lg">Your last 30 days</div>
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Gathering your trends...</div>
        ) : report ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Anxiety avg", fmt(report.averages.anxiety, "/10")],
              ["High days (7+)", String(report.highAnxietyDays)],
              ["Wellness score", fmt(report.averages.moodScore)],
              ["Sleep", fmt(report.averages.sleep, " hrs")],
              ["Water", fmt(report.averages.water, " glasses")],
              ["Movement", fmt(report.averages.exercise, " min")],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white/70 p-3">
                <div className="text-[11px] text-muted-foreground">{k}</div>
                <div className="font-display font-bold text-xl">{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No check-ins yet — start with a mood check-in 💭</div>
        )}

        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Optional password for the file
          </div>
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            type="password"
            placeholder="Leave blank for no password"
            className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <div className="text-[11px] text-muted-foreground mt-1">
            If you set one, the PDF can only be opened with that password — share it separately.
          </div>
        </div>

        <button
          onClick={download}
          disabled={!enabled || !report || busy}
          className="w-full rounded-2xl py-3 font-semibold gradient-pink text-white soft-shadow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {busy ? "Building your report..." : "Download my 30-day report"}
        </button>
        {!enabled && (
          <div className="text-[11px] text-muted-foreground text-center">
            Turn on counselor sharing above to enable the download.
          </div>
        )}
      </div>

      <div className="glass-card p-5 space-y-2">
        <div className="font-display font-bold text-lg">What's actually in the report</div>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Your own anxiety quiz scores (0–10) from the last 30 days — one line per day.</li>
          <li>The mood you picked each day, plus your daily wellness score.</li>
          <li>Sleep hours, glasses of water, minutes of movement and screen hours you logged yourself.</li>
          <li>Averages for the whole month, how many quizzes you finished, and how many days scored 7 or higher.</li>
          <li>Days you didn't check in show a dash (—) instead of a guess — nothing is filled in for you.</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Your Haven💫 chats, journal notes, messages and symptom conversations are never included. Everything is
          self-reported wellness information, not a diagnosis.
        </p>
      </div>

      <div className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Your data stays private unless you download and share it yourself.
      </div>
    </div>
  );
}
