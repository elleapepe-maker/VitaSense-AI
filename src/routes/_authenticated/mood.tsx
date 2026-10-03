import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { celebrate } from "@/lib/feedback";
import { useServerFn } from "@tanstack/react-start";
import { generateMoodTips, chatMoodFollowup } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send, ShieldCheck } from "lucide-react";
import { CrisisCare, detectCrisis } from "@/components/CrisisCare";
import { CrisisOverlay, useCrisisWatch } from "@/components/CrisisOverlay";

export const Route = createFileRoute("/_authenticated/mood")({
  component: Mood,
});

const MOODS = [
  { emoji: "🌈", label: "Great" },
  { emoji: "🌸", label: "Good" },
  { emoji: "☁️", label: "Meh" },
  { emoji: "🌧️", label: "Low" },
  { emoji: "🌪️", label: "Overwhelmed" },
];

// GAD-7 style short anxiety quiz
const ANXIETY_QUESTIONS = [
  { key: "nervous", q: "How often have you felt nervous or on edge lately?" },
  { key: "worry", q: "How often have you been unable to stop worrying?" },
  { key: "restless", q: "How often have you felt restless or hard to sit still?" },
  { key: "irritable", q: "How often have you felt easily irritated?" },
  { key: "afraid", q: "How often have you felt afraid something bad might happen?" },
  { key: "tense", q: "How often have your muscles felt tense or sore from stress?" },
  { key: "sleep", q: "How often has worry kept you from falling or staying asleep?" },
  { key: "focus", q: "How often have you had trouble concentrating on everyday things?" },
  { key: "tired", q: "How often have you felt drained or low on energy without a clear reason?" },
  { key: "dread", q: "How often have you dreaded the day ahead before it even started?" },
];
const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "A few days", value: 1 },
  { label: "More than half", value: 2 },
  { label: "Nearly every day", value: 3 },
];

function timeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

function Mood() {
  const [tab, setTab] = useState<"mood" | "anxiety">("mood");
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const runTips = useServerFn(generateMoodTips);
  const runChat = useServerFn(chatMoodFollowup);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, tips]);

  const showCrisis = useMemo(
    () => !!notes && detectCrisis(notes) || chat.some((m) => m.role === "user" && detectCrisis(m.content)),
    [notes, chat],
  );
  const lastChatMsg = useMemo(
    () => [...chat].reverse().find((m) => m.role === "user")?.content ?? "",
    [chat],
  );
  const crisis = useCrisisWatch([notes, chatInput, lastChatMsg]);

  const totalAnx = Object.values(answers).reduce((a, b) => a + b, 0);
  const anxOn10 = Math.round((totalAnx / (ANXIETY_QUESTIONS.length * 3)) * 10);

  const submit = async () => {
    setLoading(true);
    try {
      const answersMap: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        const q = ANXIETY_QUESTIONS.find((x) => x.key === k)?.q ?? k;
        answersMap[q] = OPTIONS.find((o) => o.value === v)?.label ?? String(v);
      }
      const result = await runTips({
        data: {
          kind: tab,
          mood: tab === "mood" ? mood : null,
          anxietyScore: tab === "anxiety" ? anxOn10 : null,
          answers: tab === "anxiety" ? answersMap : {},
          notes: notes || null,
          timeOfDay: timeOfDay(),
        },
      });
      setTips(result.tips);
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("mood_checkins").insert({
        user_id: u.user!.id,
        kind: tab,
        mood: mood,
        anxiety_score: tab === "anxiety" ? anxOn10 : null,
        answers: tab === "anxiety" ? answersMap : null,
        notes: notes || null,
        tips: result.tips,
      });
      celebrate();
      toast.success("Check-in saved 💗");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate tips");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setTips(null); setMood(null); setAnswers({}); setNotes(""); setChat([]); setChatInput(""); };

  const sendFollowup = async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;
    const nextHistory = [...chat, { role: "user" as const, content: text }];
    setChat(nextHistory);
    setChatInput("");
    setChatSending(true);
    try {
      const result = await runChat({
        data: {
          kind: tab,
          mood: tab === "mood" ? mood : null,
          anxietyScore: tab === "anxiety" ? anxOn10 : null,
          history: [
            { role: "assistant", content: tips ?? "" },
            ...nextHistory,
          ],
        },
      });
      setChat([...nextHistory, { role: "assistant", content: result.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send message");
      setChat(chat);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Check in with yourself</h1>
        <p className="text-sm text-muted-foreground">Little pauses make a big difference. Your entries stay private 🔒</p>
      </div>

      <CrisisOverlay open={crisis.open} onClose={crisis.close} />
      {showCrisis && <CrisisCare />}

      <div className="glass-card p-1 flex">
        {(["mood", "anxiety"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); reset(); }}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold capitalize transition ${tab === t ? "gradient-pink text-white soft-shadow" : "text-muted-foreground"}`}>
            {t === "mood" ? "💭 Mood" : "🌊 Anxiety"}
          </button>
        ))}
      </div>

      {tips ? (
        <div className="space-y-3">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl gradient-lavender flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="font-display font-bold text-lg">Your gentle plan</div>
            </div>
            <div className="text-sm whitespace-pre-line leading-relaxed">{tips}</div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-pink flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-lg leading-tight">Keep talking 💗</div>
                <div className="text-xs text-muted-foreground">I'm here whenever you need — you're not alone.</div>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {chat.length === 0 && (
                <div className="text-xs text-muted-foreground bg-white/60 rounded-2xl p-3">
                  Ask me anything, share more of what's on your mind, or just say hi.
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line leading-relaxed ${m.role === "user" ? "gradient-pink text-white soft-shadow" : "bg-white/80 border border-white"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="flex justify-start">
                  <div className="bg-white/80 border border-white rounded-2xl px-3 py-2 text-sm text-muted-foreground animate-pulse">
                    thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendFollowup(); }}
                placeholder="Type a message..."
                className="flex-1 rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
              <button
                onClick={sendFollowup}
                disabled={!chatInput.trim() || chatSending}
                className="rounded-2xl px-4 gradient-pink soft-shadow disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset} className="rounded-2xl py-3 font-semibold bg-white/70 border border-white">
              Another check-in
            </button>
            <Link to="/history" className="rounded-2xl py-3 font-semibold text-center gradient-lavender text-white soft-shadow">
              See your journey 🌸
            </Link>
          </div>
        </div>
      ) : tab === "mood" ? (
        <div className="glass-card p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">How are you feeling?</div>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button key={m.label} onClick={() => setMood(m.label)}
                  className={`rounded-2xl py-3 flex flex-col items-center gap-1 transition ${mood === m.label ? "gradient-pink text-white soft-shadow scale-105" : "bg-white/70 hover:bg-white"}`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Anything else on your mind? (optional)</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="A quick brain dump..." />
          </div>
          <button onClick={submit} disabled={!mood || loading}
            className="w-full rounded-2xl py-3 font-semibold gradient-pink soft-shadow disabled:opacity-50">
            {loading ? "Thinking..." : "Get today's tips ✨"}
          </button>
        </div>
      ) : (
        <div className="glass-card p-5 space-y-4">
          <div className="text-xs text-muted-foreground">Over the last 2 weeks...</div>
          {ANXIETY_QUESTIONS.map((q) => (
            <div key={q.key}>
              <div className="text-sm font-semibold mb-2">{q.q}</div>
              <div className="grid grid-cols-2 gap-2">
                {OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => setAnswers({ ...answers, [q.key]: o.value })}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${answers[q.key] === o.value ? "gradient-lavender text-white soft-shadow" : "bg-white/70 hover:bg-white"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(answers).length === ANXIETY_QUESTIONS.length && (
            <div className="rounded-2xl bg-white/70 p-4 text-center">
              <div className="text-xs text-muted-foreground">Your anxiety level right now</div>
              <div className="font-display text-4xl font-bold text-gradient-pink mt-1">{anxOn10}<span className="text-lg text-muted-foreground">/10</span></div>
            </div>
          )}
          <button onClick={submit} disabled={Object.keys(answers).length !== ANXIETY_QUESTIONS.length || loading}
            className="w-full rounded-2xl py-3 font-semibold gradient-pink soft-shadow disabled:opacity-50">
            {loading ? "Thinking..." : "Get personalized tips ✨"}
          </button>
        </div>
      )}

      <div className="mt-3 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Tips here are supportive, not medical advice.
      </div>
    </div>
  );
}
