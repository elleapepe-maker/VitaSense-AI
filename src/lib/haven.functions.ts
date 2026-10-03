import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callLovableAI } from "@/lib/ai-gateway.server";
import { z } from "zod";

export const HAVEN_PERSONALITIES = {
  gentle_guide: {
    label: "Gentle Guide 🌸",
    desc: "Soft, warm, patient. Like a caring older sister.",
    style: "Speak softly and patiently. Validate feelings first, then gently offer perspective. Use warm imagery. Emoji: 🌸💗✨",
  },
  hype_bestie: {
    label: "Hype Bestie 🎉",
    desc: "Energetic, encouraging, cheerleader vibes.",
    style: "Be enthusiastic and encouraging! Celebrate every win big and small. Use exclamation points, hype language, but stay genuine. Emoji: 🎉🔥💫⚡️",
  },
  calm_sage: {
    label: "Calm Sage 🌿",
    desc: "Grounded, wise, thoughtful.",
    style: "Speak with calm wisdom. Offer perspective and gentle insight. Use grounding metaphors (roots, breath, seasons). Emoji: 🌿🌙💫",
  },
  silly_comfort: {
    label: "Silly Comfort 🍡",
    desc: "Playful, light, cozy-goofy friend.",
    style: "Be playful and light. Sprinkle in gentle humor, cozy metaphors, and warm silliness — never at their expense. Emoji: 🍡🐻✨🫧",
  },
} as const;

export type HavenPersonality = keyof typeof HAVEN_PERSONALITIES;

/* ---------- Memories ---------- */
const ExtractInput = z.object({
  userMessage: z.string().min(1).max(4000),
});

export const extractHavenMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ExtractInput.parse(d))
  .handler(async ({ data, context }) => {
    // Ask AI to extract 0–2 short memorable facts, else empty array.
    let out = "";
    try {
      out = await callLovableAI([
        { role: "system", content: "You extract short memorable personal facts a supportive companion should remember (favorite things, people, struggles, coping tools that help, goals). Return ONLY a JSON array of 0-2 concise strings (max 100 chars each). If nothing worth remembering, return []. No preamble." },
        { role: "user", content: data.userMessage },
      ]);
    } catch { return { saved: 0 }; }
    let facts: string[] = [];
    try {
      const match = out.match(/\[[\s\S]*\]/);
      if (match) facts = JSON.parse(match[0]);
    } catch { /* ignore */ }
    facts = facts.filter((f) => typeof f === "string" && f.trim().length > 3).slice(0, 2);
    if (facts.length === 0) return { saved: 0 };
    const rows = facts.map((content) => ({ user_id: context.userId, content: content.slice(0, 200) }));
    await context.supabase.from("haven_memories").insert(rows);
    return { saved: rows.length };
  });

export const getHavenMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("haven_memories")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    return { memories: data ?? [] };
  });

const DeleteMemoryInput = z.object({ id: z.string().uuid() });
export const deleteHavenMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteMemoryInput.parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("haven_memories").delete().eq("id", data.id);
    return { ok: true };
  });

/* ---------- Weekly Glow Report ---------- */
export const generateWeeklyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const [moodsRes, checkinsRes, memRes, profRes] = await Promise.all([
      context.supabase.from("mood_checkins").select("mood, anxiety_score, notes, created_at").gte("created_at", weekStart.toISOString()).order("created_at"),
      context.supabase.from("daily_checkins").select("*").gte("day", weekStartStr).order("day"),
      context.supabase.from("haven_memories").select("content").order("created_at", { ascending: false }).limit(200),
      context.supabase.from("profiles").select("display_name, haven_personality").eq("id", context.userId).maybeSingle(),
    ]);

    const moods = moodsRes.data ?? [];
    const checkins = checkinsRes.data ?? [];
    const memories = (memRes.data ?? []).map((m) => m.content);

    if (moods.length === 0 && checkins.length === 0) {
      return { summary: "Not enough data yet this week. Try a mood check-in or logging your day, and I'll have a real reflection for you soon. 💗", patterns: {} };
    }

    const personality = (profRes.data?.haven_personality as HavenPersonality) ?? "gentle_guide";
    const styleNote = HAVEN_PERSONALITIES[personality]?.style ?? "";

    const summary = await callLovableAI([
      { role: "system", content: `You are Haven💫, the user's wellness companion. Write a "Weekly Glow Report" for ${profRes.data?.display_name ?? "them"}. Voice: ${styleNote}
Structure (use markdown, warm and personal, ~180 words):
✨ **This week in a sentence**
🌸 **Mood patterns** (what you noticed — days, trends)
💗 **What seemed to help** (from their notes/memories)
🌿 **Gentle observation** (one kind insight, not a lecture)
💫 **For next week** (one small, doable intention)
Never diagnose. Reference specific things they mentioned when you can.` },
      { role: "user", content: `Mood check-ins:\n${JSON.stringify(moods)}\n\nDaily logs:\n${JSON.stringify(checkins)}\n\nWhat you remember about them:\n${memories.join(" | ") || "(no memories yet)"}` },
    ]);

    const patterns = {
      moodCount: moods.length,
      checkinDays: checkins.length,
      avgAnxiety: moods.filter((m) => m.anxiety_score !== null).reduce((s, m) => s + Number(m.anxiety_score ?? 0), 0) / Math.max(1, moods.filter((m) => m.anxiety_score !== null).length),
    };

    await context.supabase.from("weekly_reports").upsert({
      user_id: context.userId,
      week_start: weekStartStr,
      summary,
      patterns,
    }, { onConflict: "user_id,week_start" });

    return { summary, patterns, weekStart: weekStartStr };
  });

export const getLatestWeeklyReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("weekly_reports")
      .select("summary, patterns, week_start, created_at")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { report: data };
  });

/* ---------- Rituals ---------- */
const CompleteRitualInput = z.object({ ritualId: z.string().min(1).max(64) });
export const completeRitual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CompleteRitualInput.parse(d))
  .handler(async ({ data, context }) => {
    const day = new Date().toISOString().slice(0, 10);
    await context.supabase.from("ritual_completions").upsert(
      { user_id: context.userId, ritual_id: data.ritualId, day },
      { onConflict: "user_id,ritual_id,day" },
    );
    return { ok: true };
  });

export const getRitualStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("ritual_completions")
      .select("day, ritual_id")
      .order("day", { ascending: false })
      .limit(120);
    const rows = data ?? [];
    const days = new Set(rows.map((r) => r.day));
    // consecutive-day streak ending today or yesterday
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 120; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) streak++;
      else if (i === 0) continue;
      else break;
    }
    const today = new Date().toISOString().slice(0, 10);
    const todayCompletions = rows.filter((r) => r.day === today).map((r) => r.ritual_id);
    return { streak, total: rows.length, todayCompletions };
  });

/* ---------- Persistent chat history (Haven remembers your conversations) ---------- */
const SaveChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(8000),
  })).min(1).max(4),
});

export const saveHavenChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveChatInput.parse(d))
  .handler(async ({ data, context }) => {
    const rows = data.messages.map((m) => ({ user_id: context.userId, role: m.role, content: m.content }));
    await context.supabase.from("haven_chat_messages").insert(rows);
    return { ok: true };
  });

export const getHavenChat = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("haven_chat_messages")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    return { messages: (data ?? []).reverse() };
  });

export const clearHavenChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("haven_chat_messages").delete().eq("user_id", context.userId);
    return { ok: true };
  });
