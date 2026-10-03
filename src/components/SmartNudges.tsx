import { Link } from "@tanstack/react-router";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

type Nudge = { emoji: string; text: string; to: "/schedule" | "/mood" | "/chat" | "/rituals" | "/weekly-glow" };

export function SmartNudges({ nudges }: { nudges: Nudge[] }) {
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setSupported(true);
    setPerm(Notification.permission);
  }, []);

  const enable = async () => {
    if (!supported) return;
    const res = await Notification.requestPermission();
    setPerm(res);
    if (res === "granted") {
      new Notification("VitaSense AI 💗", { body: "You're all set — I'll only send kind, gentle nudges." });
    }
  };

  if (nudges.length === 0 && perm === "granted") return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Smart nudges</div>
        {supported && perm !== "granted" && (
          <button onClick={enable} className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            {perm === "denied" ? <><BellOff className="w-3 h-3" /> Blocked</> : <><Bell className="w-3 h-3" /> Enable reminders</>}
          </button>
        )}
      </div>
      {nudges.length === 0 ? (
        <p className="text-sm text-muted-foreground">You're all caught up today — beautiful. 🌸</p>
      ) : (
        <div className="space-y-2">
          {nudges.slice(0, 2).map((n, i) => (
            <Link key={i} to={n.to} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white hover:bg-white transition">
              <div className="text-xl">{n.emoji}</div>
              <div className="text-sm flex-1">{n.text}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function buildNudges(args: {
  hasCheckin: boolean;
  water: number;
  exercise: number;
  sleep: number;
  moodScore: number;
  ritualsDoneToday: number;
  hasWeeklyReport: boolean;
  lastMood?: string | null;
}): Nudge[] {
  const hour = new Date().getHours();
  const n: Nudge[] = [];

  // Mood-aware nudges first so they feel personal
  if (args.lastMood === "Overwhelmed") {
    n.push({ emoji: "🫂", text: "You seemed overwhelmed — try the Butterfly Hug ritual. It's 2 mins.", to: "/rituals" });
  } else if (args.lastMood === "Low") {
    n.push({ emoji: "🌸", text: "You seem low today — a gentle grounding ritual might soften things.", to: "/rituals" });
  } else if (args.lastMood === "Meh") {
    n.push({ emoji: "🌿", text: "Feeling meh? Two-minute stretch ritual could shift the vibe.", to: "/rituals" });
  } else if (args.lastMood === "Great") {
    n.push({ emoji: "💫", text: "Loving the great vibes — save this moment in your Weekly Glow.", to: "/weekly-glow" });
  }

  if (!args.hasCheckin || args.water < 6) n.push({ emoji: "💧", text: "A glass of water sounds lovely right now.", to: "/schedule" });
  if (!args.hasCheckin || args.exercise < 15) n.push({ emoji: "🌷", text: "Even a 5-minute stretch counts as movement.", to: "/schedule" });
  if (args.ritualsDoneToday === 0) n.push({ emoji: "✨", text: "Two minutes for a tiny ritual? It'll shift the day.", to: "/rituals" });
  if (hour >= 20 && (!args.hasCheckin || args.sleep < 7)) n.push({ emoji: "🌙", text: "Winding down early tonight? Your body will thank you.", to: "/schedule" });
  if (hour >= 10 && args.hasCheckin && args.moodScore <= 5) n.push({ emoji: "💭", text: "A quick mood check-in can lighten the day.", to: "/mood" });
  if (!args.hasWeeklyReport) n.push({ emoji: "🪞", text: "Your weekly glow report is waiting — see your week in one place.", to: "/weekly-glow" });
  return n;
}
