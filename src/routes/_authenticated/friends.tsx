import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus, Check, X, Search, Users, Users2, Trash2, Flame, Trophy, MessageCircle } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { searchPeople, sendFriendRequest, respondFriendRequest, removeFriend, listFriends, getFriendStreak, getMyTodayTasks, getSharedTasksWith } from "@/lib/friends.functions";

export const Route = createFileRoute("/_authenticated/friends")({
  component: FriendsPage,
});


type Person = { id: string; display_name: string | null; username: string | null; avatar_emoji: string | null };

function FriendsPage() {
  const { theme } = useTheme();
  const masc = theme === "masculine";
  const doSearch = useServerFn(searchPeople);
  const doSend = useServerFn(sendFriendRequest);
  const doRespond = useServerFn(respondFriendRequest);
  const doRemove = useServerFn(removeFriend);
  const doList = useServerFn(listFriends);
  const doStreak = useServerFn(getFriendStreak);
  const doTasks = useServerFn(getMyTodayTasks);
  const doShared = useServerFn(getSharedTasksWith);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof listFriends>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [tasks, setTasks] = useState<Array<{ key: string; label: string; done: boolean; progress: string }>>([]);
  type SharedTask = { key: string; label: string; mineDone: boolean; theirDone: boolean; mineProgress: string; theirProgress: string };
  const [sharedTasks, setSharedTasks] = useState<Record<string, SharedTask[]>>({});

  const refresh = async () => {
    const [d, t] = await Promise.all([doList(), doTasks()]);
    setData(d);
    setTasks(t.tasks);
    setLoading(false);
    // fetch streaks for each accepted friend
    const entries = await Promise.all(
      d.accepted.map(async (f) => {
        if (!f.otherUser) return [f.id, 0] as const;
        try {
          const s = await doStreak({ data: { friendId: f.otherUser.id } });
          return [f.id, s.streak] as const;
        } catch { return [f.id, 0] as const; }
      })
    );
    setStreaks(Object.fromEntries(entries));
    // fetch shared tasks per friend
    const sharedEntries = await Promise.all(
      d.accepted.map(async (f) => {
        if (!f.otherUser) return [f.id, [] as SharedTask[]] as const;
        try {
          const s = await doShared({ data: { friendId: f.otherUser.id } });
          return [f.id, s.tasks] as const;
        } catch { return [f.id, [] as SharedTask[]] as const; }
      })
    );
    setSharedTasks(Object.fromEntries(sharedEntries));
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);


  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await doSearch({ data: { q } });
        setResults(r.results as Person[]);
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, doSearch]);

  const send = async (id: string) => {
    try {
      const r = await doSend({ data: { addresseeId: id } });
      toast.success(r.status === "accepted" ? "You're friends 💗" : "Request sent 🌸");
      setQ(""); setResults([]);
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't send request"); }
  };

  const respond = async (friendshipId: string, accept: boolean) => {
    try {
      await doRespond({ data: { friendshipId, accept } });
      toast.success(accept ? "Friend added 💗" : "Request declined");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); }
  };

  const remove = async (friendshipId: string) => {
    try {
      await doRemove({ data: { friendshipId } });
      toast.success("Removed");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); }
  };

  const existingIds = new Set([
    ...(data?.accepted ?? []).map((f) => f.otherUser?.id),
    ...(data?.outgoing ?? []).map((f) => f.otherUser?.id),
    ...(data?.incoming ?? []).map((f) => f.otherUser?.id),
  ]);

  return (
    <div className="pt-4 space-y-5 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Friends 💗</h1>
        <p className="text-sm text-muted-foreground">Share your progress with people you trust. Keep a shared wellness streak going — like Duolingo, but for feeling good.</p>
      </div>

      {/* Today's wellness tasks */}
      {tasks.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-1">
            {masc ? <Trophy className="w-4 h-4 text-primary" /> : <Flame className="w-4 h-4 text-primary" />}
            <div className="font-display font-bold text-lg">Today's wellness tasks</div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Complete any of these to keep your streaks alive with friends.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tasks.map((t) => (
              <div key={t.key} className={`rounded-2xl p-3 border flex items-center gap-3 ${t.done ? "gradient-pink text-white border-white soft-shadow" : "bg-white/70 border-white"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${t.done ? "bg-white/30" : "bg-white border border-border"}`}>
                  {t.done ? "✓" : ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.label}</div>
                  <div className={`text-[11px] ${t.done ? "opacity-90" : "text-muted-foreground"}`}>{t.progress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="glass-card p-4">
        <div className="flex items-center gap-2 bg-white/70 border border-white rounded-2xl px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search names or @usernames..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        {q.trim().length >= 2 && (
          <div className="mt-3 space-y-2">
            {searching && <div className="text-xs text-muted-foreground">Searching...</div>}
            {!searching && results.length === 0 && <div className="text-xs text-muted-foreground">No one found. Try a different name.</div>}
            {results.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white">
                <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center text-lg">{p.avatar_emoji || "🌸"}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.display_name || "Friend"}</div>
                  {p.username && <div className="text-xs text-muted-foreground truncate">@{p.username}</div>}
                </div>
                {existingIds.has(p.id) ? (
                  <span className="text-xs text-muted-foreground">Already sent</span>
                ) : (
                  <button onClick={() => send(p.id)} className="rounded-full gradient-pink text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1 soft-shadow">
                    <UserPlus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center animate-pulse">Loading...</div>
      ) : (
        <>
          {data && data.incoming.length > 0 && (
            <div className="glass-card p-5">
              <div className="font-display font-bold text-lg mb-3">Friend requests</div>
              <div className="space-y-2">
                {data.incoming.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white">
                    <div className="w-10 h-10 rounded-2xl gradient-lavender flex items-center justify-center text-lg">{f.otherUser?.avatar_emoji || "🌸"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{f.otherUser?.display_name || "Friend"}</div>
                      {f.otherUser?.username && <div className="text-xs text-muted-foreground truncate">@{f.otherUser.username}</div>}
                    </div>
                    <button onClick={() => respond(f.id, true)} className="rounded-full gradient-pink text-white p-2 soft-shadow" aria-label="Accept"><Check className="w-4 h-4" /></button>
                    <button onClick={() => respond(f.id, false)} className="rounded-full bg-white/80 border border-white p-2" aria-label="Decline"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
              {masc ? <Users2 className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
              <div className="font-display font-bold text-lg">{masc ? "Your squad" : "Your friends"}</div>
            </div>
            {data && data.accepted.length === 0 ? (
              <div className="text-sm text-muted-foreground">No friends yet — search above to add someone you trust 🌸</div>
            ) : (
              <div className="space-y-2">
                {data?.accepted.map((f) => (
                  <div key={f.id} className="bg-white/70 rounded-2xl p-3 border border-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center text-lg">{f.otherUser?.avatar_emoji || "🌸"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{f.otherUser?.display_name || "Friend"}</div>
                        {f.otherUser?.username && <div className="text-xs text-muted-foreground truncate">@{f.otherUser.username}</div>}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-primary bg-white/80 border border-white rounded-full px-2.5 py-1" title="Shared wellness streak">
                        {masc ? <Trophy className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                        {streaks[f.id] ?? 0}
                      </div>
                      <Link to="/messages" className="rounded-full bg-white/80 border border-white p-2 text-primary hover:bg-white" aria-label={`Message ${f.otherUser?.display_name || "friend"}`}><MessageCircle className="w-4 h-4" /></Link>
                      <button onClick={() => remove(f.id)} className="rounded-full bg-white/80 border border-white p-2 text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2 pl-1">
                      {(streaks[f.id] ?? 0) === 0
                        ? "A box turns pink only when BOTH of you complete it today 🌸"
                        : `${streaks[f.id]}-day shared wellness streak 🔥 — keep it going!`}
                    </div>
                    {(sharedTasks[f.id]?.length ?? 0) > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sharedTasks[f.id].map((t) => {
                          const both = t.mineDone && t.theirDone;
                          return (
                            <div key={t.key} className={`rounded-2xl p-2.5 border flex items-center gap-2 ${both ? "gradient-pink text-white border-white soft-shadow" : "bg-white/80 border-white"}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${both ? "bg-white/30" : "bg-white border border-border"}`}>{both ? "✓" : ""}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold truncate">{t.label}</div>
                                <div className={`text-[10px] ${both ? "opacity-90" : "text-muted-foreground"}`}>
                                  You {t.mineDone ? "✓" : "•"} {t.mineProgress} · Them {t.theirDone ? "✓" : "•"} {t.theirProgress}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>

          {data && data.outgoing.length > 0 && (
            <div className="glass-card p-5">
              <div className="font-display font-bold text-lg mb-3">Sent requests</div>
              <div className="space-y-2">
                {data.outgoing.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white">
                    <div className="w-10 h-10 rounded-2xl gradient-butter flex items-center justify-center text-lg">{f.otherUser?.avatar_emoji || "🌸"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{f.otherUser?.display_name || "Friend"}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <button onClick={() => remove(f.id)} className="rounded-full bg-white/80 border border-white px-3 py-1.5 text-xs font-semibold">Cancel</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
