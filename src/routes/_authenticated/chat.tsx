import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { chatWellness, generateGrounding } from "@/lib/ai.functions";
import { extractHavenMemory, getHavenMemories, getHavenChat, saveHavenChat, clearHavenChat } from "@/lib/haven.functions";
import { supabase } from "@/integrations/supabase/client";
import { Send, Star, Droplet, Footprints, Wind, Moon, ShieldCheck, Zap, Dumbbell, Sparkles, Mic, Square, Brain, Settings2, ImagePlus, X, RotateCcw } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { CrisisCare, detectCrisis } from "@/components/CrisisCare";
import { CrisisOverlay, useCrisisWatch } from "@/components/CrisisOverlay";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumDialog } from "@/components/PremiumDialog";
import { FREE_DAILY_HAVEN_MESSAGES } from "@/lib/premium";

export const Route = createFileRoute("/_authenticated/chat")({
  component: WellnessChat,
});

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };
type Profile = { name: string | null; hobbies: string[]; activities: string[]; gender: string | null; routine: string | null; personality: string | null };

const STARTERS_BASE: { icon: typeof Droplet; mascIcon?: typeof Droplet; label: string; prompt: string }[] = [
  { icon: Droplet, label: "Hydration check", prompt: "How am I doing on water today? Give me a gentle reminder." },
  { icon: Footprints, mascIcon: Dumbbell, label: "Move me", prompt: "Suggest a quick workout or stretch I can do right now." },
  { icon: Wind, label: "I need to vent", prompt: "I just want to vent for a minute — can you listen?" },
  { icon: Moon, label: "Wind-down tips", prompt: "Give me a few healthy wind-down ideas for tonight." },
];

function WellnessChat() {
  const { theme } = useTheme();
  const masc = theme === "masculine";
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi friend, I'm Haven💫 — your safe little corner. No judgement here, ever. Whether you want to vent, celebrate, spiral for a sec, or just hear something kind — I'm all yours. What's going on in your world right now? 💗" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { isActive: isPremium } = useSubscription();
  const [sentToday, setSentToday] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  const run = useServerFn(chatWellness);
  const runGrounding = useServerFn(generateGrounding);
  const runExtract = useServerFn(extractHavenMemory);
  const loadMemories = useServerFn(getHavenMemories);
  const loadChat = useServerFn(getHavenChat);
  const persistChat = useServerFn(saveHavenChat);
  const resetChat = useServerFn(clearHavenChat);
  const starters = STARTERS_BASE.map((s) => ({ ...s, icon: masc && s.mascIcon ? s.mascIcon : s.icon }));

  const showCrisis = useMemo(
    () => messages.some((m) => m.role === "user" && detectCrisis(m.content)),
    [messages],
  );
  const lastUserMsg = useMemo(
    () => [...messages].reverse().find((m) => m.role === "user")?.content ?? "",
    [messages],
  );
  const crisis = useCrisisWatch([input, lastUserMsg]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("display_name, hobbies, activities, gender, daily_routine, haven_personality").eq("id", u.user.id).maybeSingle();
      if (data) {
        setProfile({
          name: data.display_name,
          hobbies: (data.hobbies as string[] | null) ?? [],
          activities: (data.activities as string[] | null) ?? [],
          gender: data.gender ?? null,
          routine: data.daily_routine ?? null,
          personality: data.haven_personality ?? "gentle_guide",
        });
      }
      try {
        const m = await loadMemories({});
        setMemories(m.memories.map((x) => x.content));
      } catch { /* ignore */ }
      try {
        const past = await loadChat({});
        if (past.messages.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...past.messages.map((x) => ({ role: x.role as "user" | "assistant", content: x.content })),
          ]);
        }
      } catch { /* ignore */ }
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("haven_chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", u.user.id)
          .eq("role", "user")
          .gte("created_at", startOfDay.toISOString());
        setSentToday(count ?? 0);
      } catch { /* ignore */ }
    })();
  }, [loadMemories, loadChat]);


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text: string) => {
    const clean = text.trim();
    const imgs = pendingImages;
    if ((!clean && imgs.length === 0) || sending) return;
    // Premium (and the creator) get unlimited Haven💫 chats; free plan has a daily allowance.
    if (!isPremium && sentToday >= FREE_DAILY_HAVEN_MESSAGES) {
      setShowPremium(true);
      toast("You've used today's free Haven💫 messages 💗 Unlock Premium for unlimited chats.");
      return;
    }
    setSentToday((n) => n + 1);
    const userMsg: Msg = { role: "user", content: clean || (imgs.length ? "(sent a photo)" : ""), images: imgs.length ? imgs : undefined };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPendingImages([]);
    setSending(true);
    if (clean) runExtract({ data: { userMessage: clean } }).catch(() => {});
    // Build server-side history: convert images to multimodal content blocks
    const historyForServer = next.slice(-60).map((m) => {
      if (m.role === "user" && m.images && m.images.length) {
        const blocks: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
        if (m.content) blocks.push({ type: "text", text: m.content });
        for (const url of m.images) blocks.push({ type: "image_url", image_url: { url } });
        return { role: m.role, content: blocks };
      }
      return { role: m.role, content: m.content };
    });
    try {
      const result = await run({
        data: {
          history: historyForServer,
          vitals: null,
          profile: profile ? {
            name: profile.name,
            hobbies: profile.hobbies,
            activities: profile.activities,
            gender: profile.gender,
            routine: profile.routine,
            personality: profile.personality,
          } : null,
          memories,
        },
      });
      setMessages([...next, { role: "assistant", content: result.reply }]);
      persistChat({ data: { messages: [
        { role: "user" as const, content: userMsg.content || "(sent a photo)" },
        { role: "assistant" as const, content: result.reply },
      ] } }).catch(() => {});
      loadMemories({}).then((m) => setMemories(m.memories.map((x) => x.content))).catch(() => {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send message");
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).slice(0, 8).map((f) => {
      if (!f.type.startsWith("image/")) return Promise.resolve<string | null>(null);
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" is over 5MB — try a smaller photo.`);
        return Promise.resolve<string | null>(null);
      }
      return new Promise<string | null>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
        r.onerror = () => resolve(null);
        r.readAsDataURL(f);
      });
    });
    const results = (await Promise.all(readers)).filter((x): x is string => !!x);
    if (results.length) setPendingImages((prev) => [...prev, ...results]);
  };


  const grounding = async () => {
    if (sending) return;
    setSending(true);
    try {
      const recentHistory = messages.slice(-6);
      const result = await runGrounding({ data: { recentHistory } });
      setMessages([...messages, { role: "assistant", content: `✨ **Grounding exercise**\n\n${result.reply}` }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate exercise");
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size < 2048) { toast.error("That was too short — try again."); return; }
        setTranscribing(true);
        try {
          const ext = (rec.mimeType || "").includes("mp4") ? "mp4" : "webm";
          const fd = new FormData();
          fd.append("file", blob, `recording.${ext}`);
          const res = await fetch("/api/voice/transcribe", { method: "POST", body: fd });
          if (!res.ok) throw new Error(await res.text().catch(() => "Transcription failed"));
          const { text } = await res.json();
          if (text?.trim()) {
            setInput(text.trim());
          } else {
            toast.error("Couldn't hear anything — try again");
          }
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Transcription failed");
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access is needed to record");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  };

  return (
    <div className="pt-4 flex flex-col" style={{ minHeight: "calc(100vh - 180px)" }}>
      <CrisisOverlay open={crisis.open} onClose={crisis.close} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            {masc ? <Zap className="w-5 h-5 text-white" fill="white" /> : <Star className="w-5 h-5 text-white" fill="white" />}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">Haven💫</h1>
            <p className="text-xs text-muted-foreground">{masc ? "Your safe space to reset, plan, or talk through anything." : "Your warm, judgement-free space to vent, chat, or get a gentle nudge."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-white/70 rounded-full px-2 py-1 border border-white">
              <Brain className="w-3 h-3" /> Remembers {memories.length}
            </div>
          )}
          <button
            onClick={async () => {
              if (sending) return;
              try {
                await resetChat({});
                setMessages([{ role: "assistant", content: "Fresh start 💗 I still remember the important things about you. What's on your mind?" }]);
              } catch {
                toast.error("Couldn't clear the chat — try again in a moment.");
              }
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-white/80 hover:bg-white rounded-full px-3 py-1.5 border border-white"
            title="Start a fresh conversation"
          >
            <RotateCcw className="w-3 h-3" /> Start fresh
          </button>
          <Link
            to="/profile"
            hash="haven-personality"
            className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-white/80 hover:bg-white rounded-full px-3 py-1.5 border border-white soft-shadow"
            title="Customize Haven"
          >
            <Settings2 className="w-3 h-3" /> Customize Haven
          </Link>
        </div>
      </div>

      <div className="glass-card p-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-[40vh]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line leading-relaxed ${m.role === "user" ? "gradient-pink text-white soft-shadow" : "bg-white/80 border border-white"}`}>
                {m.images && m.images.length > 0 && (
                  <div className={`grid gap-1 mb-1 ${m.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {m.images.map((src, idx) => (
                      <img key={idx} src={src} alt="attachment" className="rounded-xl max-h-56 object-cover w-full" />
                    ))}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white/80 border border-white rounded-2xl px-3 py-2 text-sm text-muted-foreground animate-pulse">
                thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {starters.map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                disabled={sending}
                className="text-left flex items-center gap-2 rounded-2xl bg-white/70 hover:bg-white border border-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                <s.icon className="w-4 h-4 text-primary" />
                {s.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={grounding}
          disabled={sending}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl bg-white/70 hover:bg-white border border-white px-3 py-2.5 text-sm font-semibold text-primary disabled:opacity-50 transition"
        >
          <Sparkles className="w-4 h-4" />
          Generate a grounding exercise
        </button>


        {pendingImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {pendingImages.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="pending" className="w-16 h-16 object-cover rounded-xl border border-white soft-shadow" />
                <button
                  onClick={() => setPendingImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-border soft-shadow"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ""; }}
        />

        <div className="flex gap-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            placeholder={transcribing ? "Transcribing your voice..." : recording ? "Recording... tap the square to stop." : "Say anything, or attach a photo..."}
            disabled={recording || transcribing}
            className="flex-1 rounded-2xl border border-border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 text-sm disabled:opacity-70"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={sending || recording || transcribing}
            className="rounded-2xl px-4 border border-white bg-white/80 flex items-center justify-center disabled:opacity-50"
            aria-label="Attach photos"
            title="Attach photos"
          >
            <ImagePlus className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={sending || transcribing}
            className={`rounded-2xl px-4 border border-white flex items-center justify-center disabled:opacity-50 ${recording ? "bg-red-100 animate-pulse" : "bg-white/80"}`}
            aria-label={recording ? "Stop recording" : "Start voice note"}
            title={recording ? "Stop" : "Voice note"}
          >
            {recording ? <Square className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-primary" />}
          </button>
          <button
            onClick={() => send(input)}
            disabled={(!input.trim() && pendingImages.length === 0) || sending || recording}
            className="rounded-2xl px-4 gradient-pink soft-shadow disabled:opacity-50 flex items-center justify-center"
            aria-label="Send"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {showCrisis && <div className="mt-4"><CrisisCare /></div>}

      <div className="mt-3 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Haven💫 is a supportive companion, not a doctor. Your entries stay private.
      </div>

      {!isPremium && (
        <div className="mt-2 text-[11px] text-center text-muted-foreground">
          {Math.max(0, FREE_DAILY_HAVEN_MESSAGES - sentToday)} free Haven💫 messages left today ·{" "}
          <button onClick={() => setShowPremium(true)} className="underline font-semibold text-primary">
            Unlock unlimited
          </button>
        </div>
      )}

      <PremiumDialog open={showPremium} onClose={() => setShowPremium(false)} />

    </div>
  );
}
