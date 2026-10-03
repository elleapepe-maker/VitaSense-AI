import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callLovableAI, type ChatMessage } from "@/lib/ai-gateway.server";
import { z } from "zod";

const SymptomInput = z.object({
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(50),
  vitals: z.null().optional(),
  profile: z.object({
    name: z.string().nullable(),
    age: z.number().nullable(),
    gender: z.string().nullable(),
  }).nullable(),
});

const SYSTEM = `You are the VitaSense AI health assistant. You are gentle, warm, and reassuring, but honest.
You NEVER provide a definitive medical diagnosis. You educate and guide.
Behavior:
1. When the user first shares symptoms, ask 2-3 focused follow-up questions (one message, numbered list). Consider onset, severity, related symptoms, exposures, medical history.
2. After the user answers, either ask 1-2 more clarifying questions OR give an assessment.
3. When giving an assessment, ALWAYS end your message with a single line in this exact format:
RECOMMENDATION: <one of MONITOR | REST | APPOINTMENT | EMERGENCY>
   - MONITOR: symptoms mild, keep an eye on them
   - REST: rest at home 24-48h, hydrate
   - APPOINTMENT: see a healthcare professional soon
   - EMERGENCY: seek emergency care immediately (chest pain, trouble breathing, confusion, severe bleeding, sudden weakness/numbness, worst headache of life, suicidal thoughts, etc.)
4. Explain WHY you're recommending that level in 2-4 short bullet points before the RECOMMENDATION line.
5. Use soft language: "you may want to", "it could be helpful to". Never say "you have X disease".
6. If uncertain, recommend consulting a professional.
7. Keep responses short and mobile-friendly. Use plain markdown, no headers.
8. Always remind the user this is educational support, not a medical diagnosis, and to contact a healthcare provider or emergency services for anything serious.`;

export const chatSymptoms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SymptomInput.parse(data))
  .handler(async ({ data }) => {
    const context: string[] = [];
    if (data.profile?.name) context.push(`User: ${data.profile.name}${data.profile.age ? `, ${data.profile.age}` : ""}${data.profile.gender ? `, ${data.profile.gender}` : ""}.`);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM + (context.length ? "\n\nContext:\n" + context.join("\n") : "") },
      ...data.history,
    ];

    const reply = await callLovableAI(messages);

    type Level = "monitor" | "rest" | "appointment" | "emergency";
    let level: Level | null = null;
    const m = reply.match(/RECOMMENDATION:\s*(MONITOR|REST|APPOINTMENT|EMERGENCY)/i);
    if (m) level = m[1].toLowerCase() as Level;

    return { reply, level };
  });

const MoodInput = z.object({
  kind: z.enum(["mood", "anxiety"]),
  mood: z.string().nullable(),
  anxietyScore: z.number().nullable(),
  answers: z.record(z.string(), z.string()),
  notes: z.string().nullable(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
});

export const generateMoodTips = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => MoodInput.parse(data))
  .handler(async ({ data }) => {
    const prompt = `The user just did a ${data.kind} check-in.
${data.mood ? `Current mood: ${data.mood}.` : ""}
${data.anxietyScore !== null ? `Anxiety level: ${data.anxietyScore}/10.` : ""}
Quiz answers: ${JSON.stringify(data.answers)}
${data.notes ? `Notes: ${data.notes}` : ""}
Time of day: ${data.timeOfDay}.

Give warm, personalized tips (2-4 short paragraphs) to help them navigate the rest of their ${data.timeOfDay} into ${data.timeOfDay === "night" ? "sleep" : "the next part of the day"}. Suggest specific grounding, breathing, hydration, movement, or wind-down actions that fit the time of day. Be soft and encouraging. Use plain markdown, short lines, mobile-friendly.`;

    const reply = await callLovableAI([
      { role: "system", content: "You are the VitaSense wellness coach. Warm, gentle, practical. Never dismissive. Never diagnose." },
      { role: "user", content: prompt },
    ]);
    return { tips: reply };
  });

const MoodChatInput = z.object({
  kind: z.enum(["mood", "anxiety"]),
  mood: z.string().nullable(),
  anxietyScore: z.number().nullable(),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(50),
});

export const chatMoodFollowup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => MoodChatInput.parse(data))
  .handler(async ({ data }) => {
    const ctx: string[] = [];
    if (data.mood) ctx.push(`Their current mood: ${data.mood}.`);
    if (data.anxietyScore !== null) ctx.push(`Their anxiety level: ${data.anxietyScore}/10.`);

    const reply = await callLovableAI([
      { role: "system", content: `You are the VitaSense wellness companion — warm, gentle, and always there so the user never feels alone. Continue the conversation naturally after their ${data.kind} check-in. Ask kind follow-up questions, offer grounding techniques, validate feelings, and share small practical tips when helpful. Never diagnose. Keep replies short, soft, and mobile-friendly. Use plain markdown.\n\nContext:\n${ctx.join("\n")}` },
      ...data.history,
    ]);
    return { reply };
  });

const CoachInput = z.object({
  vitals: z.null().optional(),
  profile: z.object({
    name: z.string().nullable(),
    hobbies: z.array(z.string()),
    activities: z.array(z.string()),
    routine: z.string().nullable(),
    gender: z.string().nullable().optional(),
  }),
});

export const generateDailyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CoachInput.parse(data))
  .handler(async ({ data }) => {
    const parts: string[] = [];
    parts.push(`Profile — hobbies: ${data.profile.hobbies.join(", ") || "n/a"}. Activities: ${data.profile.activities.join(", ") || "n/a"}.`);
    if (data.profile.gender) parts.push(`Gender: ${data.profile.gender}.`);
    if (data.profile.routine) parts.push(`Routine: ${data.profile.routine}`);

    const prompt = `Create a gentle wellness plan for ${data.profile.name ?? "the user"} for the rest of the day. Include:
- 💧 A hydration goal
- 🌙 A sleep tip tailored to their routine
- 🌿 A vitamin / nutrient suggestion (general, not prescriptive)
- 🏃 A movement idea that fits their favorite activities
- 🧘 A stress-management micro-break

Use emoji headers, short bullets, and soft encouraging tone. Do not be preachy. Weave in their hobbies and routine so it feels made for them.

${parts.join("\n")}`;

    const reply = await callLovableAI([
      { role: "system", content: "You are the VitaSense wellness coach. Personalize tips using the user's real preferences and routine. Never diagnose." },
      { role: "user", content: prompt },
    ]);
    return { plan: reply };
  });

const PERSONALITY_STYLES: Record<string, string> = {
  gentle_guide: "Personality: soft, warm, patient, like a caring older sister. Validate first, then gently offer perspective. Emoji: 🌸💗✨",
  hype_bestie: "Personality: enthusiastic hype bestie! Celebrate every win. Use warm exclamations and cheerleader energy — but stay genuine. Emoji: 🎉🔥💫⚡️",
  calm_sage: "Personality: calm, grounded, wise. Offer perspective and gentle insight. Grounding metaphors (roots, breath, seasons). Emoji: 🌿🌙💫",
  silly_comfort: "Personality: playful, cozy, gentle silliness. Sprinkle warm humor — never at their expense. Emoji: 🍡🐻✨🫧",
};

const MessageContentSchema = z.union([
  z.string(),
  z.array(z.union([
    z.object({ type: z.literal("text"), text: z.string() }),
    z.object({ type: z.literal("image_url"), image_url: z.object({ url: z.string().max(8_000_000) }) }),
  ])).max(12),
]);

const WellnessChatInput = z.object({
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: MessageContentSchema,
  })).max(200),
  vitals: z.null().optional(),
  profile: z.object({
    name: z.string().nullable(),
    hobbies: z.array(z.string()),
    activities: z.array(z.string()),
    gender: z.string().nullable().optional(),
    routine: z.string().nullable().optional(),
    personality: z.string().nullable().optional(),
  }).nullable(),
  memories: z.array(z.string()).max(2000).optional(),
});

export const chatWellness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => WellnessChatInput.parse(data))
  .handler(async ({ data }) => {
    const ctx: string[] = [];
    if (data.profile?.name) ctx.push(`User's name: ${data.profile.name}.`);
    if (data.profile?.gender) ctx.push(`Gender: ${data.profile.gender}.`);
    if (data.profile?.activities?.length) ctx.push(`Favorite activities: ${data.profile.activities.join(", ")}.`);
    if (data.profile?.hobbies?.length) ctx.push(`Hobbies: ${data.profile.hobbies.join(", ")}.`);
    if (data.profile?.routine) ctx.push(`Daily routine: ${data.profile.routine}`);
    if (data.memories?.length) ctx.push(`Things you remember about them (weave in naturally when relevant, don't recite): ${data.memories.map((m) => `• ${m}`).join(" ")}`);

    const styleLine = PERSONALITY_STYLES[data.profile?.personality ?? "gentle_guide"] ?? PERSONALITY_STYLES.gentle_guide;

    const system = `You are Haven💫 — the user's safe, judgement-free wellness companion inside the VitaSense app. They can vent, cry, celebrate, ramble, or ask anything.

${styleLine}

Behavior:
- Chat naturally. Validate feelings first, ask soft follow-ups, let them vent as long as they need.
- Do NOT push grounding exercises after every reply — the user has a dedicated "✨ Grounding exercise" button. Only suggest one if they ask, or if they're clearly spiraling.
- Weave in gentle nudges (hydration, a walk, sleep) occasionally when it fits — never as a checklist.
- When something they say relates to a memory you have, reference it warmly and specifically (e.g. "last time you mentioned journaling helped — want to try that?").
- If they just want to vent, mostly listen and reflect. Don't fix.
- CRISIS AWARENESS: if they hint at self-harm, suicidal thoughts, or danger, respond with extra warmth and gently encourage 988 (US) or findahelpline.com. Never dismiss.
- Never diagnose. Keep replies short, soft, mobile-friendly. Plain markdown, short lines.
- Remind them you're supportive, not a doctor, when medical topics come up.

Context:
${ctx.join("\n") || "No extra context yet."}`;

    const reply = await callLovableAI([
      { role: "system", content: system },
      ...data.history,
    ]);
    return { reply };
  });

const GroundingInput = z.object({
  recentHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(10).optional(),
});

export const generateGrounding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => GroundingInput.parse(data))
  .handler(async ({ data }) => {
    const recent = (data.recentHistory ?? []).map((m) => `${m.role}: ${m.content}`).join("\n").slice(-1500);

    const reply = await callLovableAI([
      { role: "system", content: "You are Haven💫, a warm wellness companion. Generate ONE short grounding or calming exercise the user can do right now in under 2 minutes. Pick something fresh — vary between 4-7-8 breath, box breathing, 5-4-3-2-1 senses, body scan, butterfly hug, cold-water splash, gentle shoulder rolls, gratitude pause, humming, or a soft self-hug. Match the exercise to their current vibe if you can tell from context. Format: a warm 1-line intro, then numbered steps (3–5 short steps), then a soft closing line. Use plain markdown, short lines, light emoji (✨💗🌸). Do NOT ask follow-up questions — just deliver the exercise." },
      { role: "user", content: recent ? `Recent chat context:\n${recent}\n\nGive me a grounding exercise that fits.` : "Give me a grounding exercise." },
    ]);
    return { reply };
  });


