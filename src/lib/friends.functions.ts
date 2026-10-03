import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const searchPeople = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data, context }) => {
    const q = (data.q ?? "").trim();
    if (q.length < 2) return { results: [] as Array<{ id: string; display_name: string | null; username: string | null; avatar_emoji: string | null }> };
    const { data: rows, error } = await context.supabase.rpc("search_users", { q });
    if (error) throw new Error(error.message);
    return { results: rows ?? [] };
  });

export const sendFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { addresseeId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.addresseeId === userId) throw new Error("You can't friend yourself 💗");
    // If either direction already exists, no-op or accept
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${data.addresseeId}),and(requester_id.eq.${data.addresseeId},addressee_id.eq.${userId})`)
      .maybeSingle();
    if (existing) {
      if (existing.status === "accepted") return { ok: true, status: "accepted" };
      // if there's a pending request from the other side, accept it
      if (existing.requester_id === data.addresseeId && existing.addressee_id === userId) {
        const { error } = await supabase.from("friendships").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", existing.id);
        if (error) throw new Error(error.message);
        return { ok: true, status: "accepted" };
      }
      return { ok: true, status: "pending" };
    }
    const { error } = await supabase.from("friendships").insert({ requester_id: userId, addressee_id: data.addresseeId, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true, status: "pending" };
  });

export const respondFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { friendshipId: string; accept: boolean }) => data)
  .handler(async ({ data, context }) => {
    if (data.accept) {
      const { error } = await context.supabase.from("friendships").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", data.friendshipId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("friendships").delete().eq("id", data.friendshipId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const removeFriend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { friendshipId: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("friendships").delete().eq("id", data.friendshipId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

type FriendRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  otherUser: { id: string; display_name: string | null; username: string | null; avatar_emoji: string | null } | null;
};

export const listFriends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const otherIds = Array.from(new Set((rows ?? []).map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id))));
    let profiles: Record<string, { id: string; display_name: string | null; username: string | null; avatar_emoji: string | null }> = {};
    if (otherIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, username, avatar_emoji").in("id", otherIds);
      profiles = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));
    }
    const enriched: FriendRow[] = (rows ?? []).map((r) => {
      const otherId = r.requester_id === userId ? r.addressee_id : r.requester_id;
      return { ...r, otherUser: profiles[otherId] ?? null };
    });
    return {
      me: userId,
      accepted: enriched.filter((r) => r.status === "accepted"),
      incoming: enriched.filter((r) => r.status === "pending" && r.addressee_id === userId),
      outgoing: enriched.filter((r) => r.status === "pending" && r.requester_id === userId),
    };
  });

/** Shared wellness streak (# consecutive days both friends had activity). */
export const getFriendStreak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { friendId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: streak, error } = await context.supabase.rpc("friend_wellness_streak", { _friend_id: data.friendId });
    if (error) throw new Error(error.message);
    return { streak: Number(streak ?? 0) };
  });

/** Today's wellness tasks for the signed-in user, derived from existing data. */
export const getMyTodayTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: c }, { data: moods }] = await Promise.all([
      supabase.from("daily_checkins").select("water_glasses, sleep_hours, exercise_minutes, meals").eq("user_id", userId).eq("day", today).maybeSingle(),
      supabase.from("mood_checkins").select("mood, created_at").eq("user_id", userId).eq("kind", "mood").not("mood", "is", null).order("created_at", { ascending: false }).limit(30),
    ]);
    // 3 great days in a row (any recent window)
    const perDay = new Map<string, string>();
    (moods ?? []).forEach((m) => {
      const d = new Date(m.created_at).toISOString().slice(0, 10);
      if (m.mood && !perDay.has(d)) perDay.set(d, m.mood);
    });
    let greatStreak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (perDay.get(key) === "Great") greatStreak++;
      else if (i === 0) continue;
      else break;
    }
    const todayMood = perDay.get(today);
    return {
      tasks: [
        { key: "water", label: "Drink 8 glasses of water 💧", done: (c?.water_glasses ?? 0) >= 8, progress: `${c?.water_glasses ?? 0}/8` },
        { key: "move", label: "Move for 20+ minutes 🌷", done: (c?.exercise_minutes ?? 0) >= 20, progress: `${c?.exercise_minutes ?? 0}/20 min` },
        { key: "sleep", label: "Sleep 7+ hours 🌙", done: Number(c?.sleep_hours ?? 0) >= 7, progress: `${Number(c?.sleep_hours ?? 0).toFixed(1)}/7 hrs` },
        { key: "meals", label: "Eat 3 nourishing meals 🍽️", done: (c?.meals ?? 0) >= 3, progress: `${c?.meals ?? 0}/3` },
        { key: "mood", label: "Do a mood check-in 💭", done: !!todayMood, progress: todayMood ? "Done" : "Not yet" },
        { key: "great3", label: "Log 3 'Great' days in a row 🌈", done: greatStreak >= 3, progress: `${Math.min(greatStreak, 3)}/3` },
      ],
    };
  });

/** Shared tasks with a specific friend — box is "done" only when BOTH have completed it today. */
export const getSharedTasksWith = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { friendId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const friendId = data.friendId;
    // confirm friendship
    const { data: fr } = await supabase
      .from("friendships")
      .select("id,status,requester_id,addressee_id")
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)
      .maybeSingle();
    if (!fr || fr.status !== "accepted") throw new Error("Not friends");

    const today = new Date().toISOString().slice(0, 10);
    const [mineC, theirC, mineM, theirM] = await Promise.all([
      supabase.from("daily_checkins").select("water_glasses, sleep_hours, exercise_minutes, meals").eq("user_id", userId).eq("day", today).maybeSingle(),
      supabase.from("daily_checkins").select("water_glasses, sleep_hours, exercise_minutes, meals").eq("user_id", friendId).eq("day", today).maybeSingle(),
      supabase.from("mood_checkins").select("mood, created_at").eq("user_id", userId).eq("kind", "mood").not("mood", "is", null).order("created_at", { ascending: false }).limit(30),
      supabase.from("mood_checkins").select("mood, created_at").eq("user_id", friendId).eq("kind", "mood").not("mood", "is", null).order("created_at", { ascending: false }).limit(30),
    ]);

    const greatStreakFor = (rows: Array<{ mood: string | null; created_at: string }> | null) => {
      const perDay = new Map<string, string>();
      (rows ?? []).forEach((m) => {
        const d = new Date(m.created_at).toISOString().slice(0, 10);
        if (m.mood && !perDay.has(d)) perDay.set(d, m.mood);
      });
      let s = 0;
      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (perDay.get(key) === "Great") s++;
        else if (i === 0) continue;
        else break;
      }
      return { streak: s, todayMood: perDay.get(today) };
    };
    const mine = greatStreakFor(mineM.data);
    const theirs = greatStreakFor(theirM.data);

    type T = { key: string; label: string; mineDone: boolean; theirDone: boolean; mineProgress: string; theirProgress: string };
    const tasks: T[] = [
      { key: "water", label: "Drink 8 glasses of water 💧",
        mineDone: (mineC.data?.water_glasses ?? 0) >= 8, theirDone: (theirC.data?.water_glasses ?? 0) >= 8,
        mineProgress: `${mineC.data?.water_glasses ?? 0}/8`, theirProgress: `${theirC.data?.water_glasses ?? 0}/8` },
      { key: "move", label: "Move for 20+ minutes 🌷",
        mineDone: (mineC.data?.exercise_minutes ?? 0) >= 20, theirDone: (theirC.data?.exercise_minutes ?? 0) >= 20,
        mineProgress: `${mineC.data?.exercise_minutes ?? 0}/20`, theirProgress: `${theirC.data?.exercise_minutes ?? 0}/20` },
      { key: "sleep", label: "Sleep 7+ hours 🌙",
        mineDone: Number(mineC.data?.sleep_hours ?? 0) >= 7, theirDone: Number(theirC.data?.sleep_hours ?? 0) >= 7,
        mineProgress: `${Number(mineC.data?.sleep_hours ?? 0).toFixed(1)}/7`, theirProgress: `${Number(theirC.data?.sleep_hours ?? 0).toFixed(1)}/7` },
      { key: "meals", label: "Eat 3 nourishing meals 🍽️",
        mineDone: (mineC.data?.meals ?? 0) >= 3, theirDone: (theirC.data?.meals ?? 0) >= 3,
        mineProgress: `${mineC.data?.meals ?? 0}/3`, theirProgress: `${theirC.data?.meals ?? 0}/3` },
      { key: "mood", label: "Do a mood check-in 💭",
        mineDone: !!mine.todayMood, theirDone: !!theirs.todayMood,
        mineProgress: mine.todayMood ? "Done" : "Not yet", theirProgress: theirs.todayMood ? "Done" : "Not yet" },
      { key: "great3", label: "3 'Great' days in a row 🌈",
        mineDone: mine.streak >= 3, theirDone: theirs.streak >= 3,
        mineProgress: `${Math.min(mine.streak, 3)}/3`, theirProgress: `${Math.min(theirs.streak, 3)}/3` },
    ];
    return { tasks };
  });

