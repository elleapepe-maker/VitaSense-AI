import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Clean up app rows first (RLS bypass via admin).
    await Promise.all([
      supabaseAdmin.from("mood_checkins").delete().eq("user_id", userId),
      supabaseAdmin.from("symptom_sessions").delete().eq("user_id", userId),
      supabaseAdmin.from("daily_checkins").delete().eq("user_id", userId),
      supabaseAdmin.from("vitals_snapshots").delete().eq("user_id", userId),
      supabaseAdmin.from("profiles").delete().eq("id", userId),
    ]);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Privacy-first data export: everything we store about the signed-in user. */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [profile, moods, checkins, symptoms, memories, chats, rituals, reviews, replies, reports] = await Promise.all([
      sb.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      sb.from("mood_checkins").select("*").order("created_at", { ascending: true }),
      sb.from("daily_checkins").select("*").order("day", { ascending: true }),
      sb.from("symptom_sessions").select("*").order("created_at", { ascending: true }),
      sb.from("haven_memories").select("*").order("created_at", { ascending: true }),
      sb.from("haven_chat_messages").select("*").order("created_at", { ascending: true }),
      sb.from("ritual_completions").select("*").order("day", { ascending: true }),
      sb.from("reviews").select("*"),
      sb.from("review_replies").select("*"),
      sb.from("weekly_reports").select("*").order("week_start", { ascending: true }),
    ]);

    return {
      exported_at: new Date().toISOString(),
      app: "VitaSense AI",
      profile: profile.data ?? null,
      mood_checkins: moods.data ?? [],
      daily_checkins: checkins.data ?? [],
      symptom_sessions: symptoms.data ?? [],
      haven_memories: memories.data ?? [],
      haven_chat_messages: chats.data ?? [],
      ritual_completions: rituals.data ?? [],
      reviews: reviews.data ?? [],
      review_replies: replies.data ?? [],
      weekly_reports: reports.data ?? [],
    };
  });
