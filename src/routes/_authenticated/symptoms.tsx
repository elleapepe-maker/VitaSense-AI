import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, Heart } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { chatSymptoms } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { CrisisOverlay, useCrisisWatch } from "@/components/CrisisOverlay";

export const Route = createFileRoute("/_authenticated/symptoms")({
  component: Symptoms,
});

type Msg = { role: "user" | "assistant"; content: string };

const LEVEL_META = {
  monitor: { color: "bg-accent text-accent-foreground", label: "🟣 Monitor at home", note: "Keep an eye on symptoms; rest & hydrate." },
  rest: { color: "gradient-mint", label: "🔵 Rest at home", note: "Take it easy for 24–48h and monitor." },
  appointment: { color: "gradient-butter", label: "🟡 Schedule an appointment", note: "Consider seeing a healthcare provider." },
  emergency: { color: "bg-destructive text-destructive-foreground", label: "🔴 Seek emergency care", note: "Call your local emergency services now." },
} as const;

function Symptoms() {
  const chat = useServerFn(chatSymptoms);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [level, setLevel] = useState<keyof typeof LEVEL_META | null>(null);
  const [profile, setProfile] = useState<{ name: string | null; age: number | null; gender: string | null } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const crisis = useCrisisWatch([input, lastUserText]);


  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: p } = await supabase.from("profiles").select("display_name, age, gender").eq("id", u.user!.id).maybeSingle();
      setProfile({ name: p?.display_name ?? null, age: p?.age ?? null, gender: p?.gender ?? null });
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const result = await chat({
        data: {
          history: next,
          vitals: null,
          profile,
        },
      });
      setMessages([...next, { role: "assistant", content: result.reply }]);
      if (result.level) setLevel(result.level);

      // persist session
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("symptom_sessions").insert({
        user_id: u.user!.id,
        initial_description: next[0]?.content ?? "",
        messages: [...next, { role: "assistant", content: result.reply }],
        recommendation: result.reply,
        recommendation_level: result.level,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI is unavailable");
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setMessages([]); setLevel(null); };

  return (
    <div className="pt-4 space-y-4">
      <CrisisOverlay open={crisis.open} onClose={crisis.close} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Symptom check</h1>
          <p className="text-sm text-muted-foreground">Describe how you feel — I'll ask a few questions.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={reset} className="text-xs font-semibold text-primary">New check</button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-lavender flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <div className="font-display font-bold">Tell me what's going on 🌸</div>
              <p className="text-sm text-muted-foreground mt-1">
                For example: "I have a sore throat and a fever", or "My stomach's been hurting since this morning."
              </p>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="space-y-3 max-h-[55vh] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-line text-sm leading-relaxed ${m.role === "user" ? "gradient-pink text-white" : "glass-card"}`}>
              {m.content.replace(/RECOMMENDATION:.*$/i, "").trim()}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="glass-card px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {level === "emergency" && (
        <div className="rounded-2xl p-5 bg-destructive text-destructive-foreground soft-shadow border-2 border-destructive">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-display font-bold text-lg">This sounds serious</div>
              <p className="text-sm opacity-95 mt-1">Please contact a healthcare provider or call your local emergency number right away.</p>
              <a href="tel:911" className="inline-block mt-3 rounded-full bg-white/90 text-destructive px-4 py-2 text-sm font-bold">Call emergency services</a>
            </div>
          </div>
        </div>
      )}
      {level && level !== "emergency" && (
        <div className={`rounded-2xl p-5 soft-shadow ${LEVEL_META[level].color}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-display font-bold text-lg">{LEVEL_META[level].label}</div>
              <p className="text-sm opacity-90 mt-1">{LEVEL_META[level].note}</p>
              <p className="text-xs opacity-70 mt-3">This is educational guidance from an AI companion, not a medical diagnosis.</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-2 flex items-end gap-2 sticky bottom-24">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Describe how you're feeling..."
          rows={1}
          className="flex-1 bg-transparent px-3 py-2 outline-none resize-none max-h-32"
        />
        <button onClick={send} disabled={sending || !input.trim()}
          className="rounded-xl gradient-pink p-3 soft-shadow disabled:opacity-50">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
