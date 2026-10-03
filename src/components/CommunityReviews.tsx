import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { isCreator } from "@/lib/creator";
import { toast } from "sonner";
import { MessageCircle, Send, Pencil, Trash2 } from "lucide-react";

const FALLBACK_REVIEWS = [
  { id: "f1", display_name: "Zehra", avatar_emoji: "🌸", rating: 5, body: "VitaSense AI feels like a friend checking in. The mood check-ins actually help me slow down." },
  { id: "f2", display_name: "Kareem", avatar_emoji: "🌿", rating: 5, body: "Haven💫 is so gentle and kind. It's the calm little space I didn't know I needed." },
  { id: "f3", display_name: "Aanya", avatar_emoji: "💫", rating: 5, body: "The anxiety chat helped me through a really hard night. I never felt alone using it." },
];

type Stats = { total: number; average: number; s1: number; s2: number; s3: number; s4: number; s5: number };
type Review = { id: string; user_id?: string | null; display_name: string | null; avatar_emoji: string | null; rating: number; body: string | null };
type Reply = { id: string; review_id: string; author_id: string; author_name: string | null; author_emoji: string | null; body: string; created_at: string };

export function CommunityReviews({ compact = false }: { compact?: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const user = useAuthUser();
  const creator = isCreator(user?.email);

  const loadReplies = () => {
    supabase
      .from("review_replies")
      .select("id, review_id, author_id, author_name, author_emoji, body, created_at")
      .order("created_at", { ascending: true })
      .then(({ data }) => setReplies((data ?? []) as Reply[]));
  };

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, user_id, display_name, avatar_emoji, rating, body")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data as Review[]);
      });

    supabase.rpc("review_stats").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setStats({
        total: Number(row.total ?? 0),
        average: Number(row.average ?? 0),
        s1: Number(row.s1 ?? 0), s2: Number(row.s2 ?? 0), s3: Number(row.s3 ?? 0),
        s4: Number(row.s4 ?? 0), s5: Number(row.s5 ?? 0),
      });
    });

    loadReplies();
  }, []);

  const list: Review[] = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <div className="space-y-6">
      {stats && stats.total > 0 && (
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <div className="font-display text-5xl font-bold text-gradient-pink">{stats.average.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= Math.round(stats.average) ? "text-primary" : "text-muted-foreground/30"}>★</span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.total} {stats.total === 1 ? "rating" : "ratings"} so far 💗
              </div>
            </div>
            <div className="flex-1 min-w-[220px] space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((n) => {
                const count = stats[`s${n}` as keyof Stats] as number;
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-muted-foreground">{n}★</span>
                    <div className="flex-1 h-2 rounded-full bg-white/70 overflow-hidden">
                      <div className="h-full gradient-pink rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={compact ? "grid grid-cols-1 gap-3" : "grid md:grid-cols-3 gap-5"}>
        {list.map((t) => (
          <ReviewCard
            key={t.id}
            review={t}
            compact={compact}
            replies={replies.filter((r) => r.review_id === t.id)}
            canReply={!!user && (creator || (!!t.user_id && t.user_id === user.id))}
            user={user}
            onReplied={loadReplies}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review, compact, replies, canReply, user, onReplied,
}: {
  review: Review;
  compact: boolean;
  replies: Reply[];
  canReply: boolean;
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null;
  onReplied: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setSending(true);
    const name = (user.user_metadata?.["display_name"] as string | undefined) || "Ellea 💗";
    const { error } = await supabase.from("review_replies").insert({
      review_id: review.id,
      author_id: user.id,
      author_name: name,
      author_emoji: "💗",
      body,
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send that reply just yet.");
      return;
    }
    setText("");
    toast.success("Reply sent 💬 They'll get a notification.");
    onReplied();
  };

  return (
    <div className={compact ? "glass-card p-4" : "glass-card p-6"}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-2xl">{review.avatar_emoji || "🌸"}</div>
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating }).map((_, i) => (
            <span key={i} className="text-primary text-sm">★</span>
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed">
        {review.body?.trim() ? `"${review.body}"` : `Rated VitaSense AI ${review.rating} ${review.rating === 1 ? "star" : "stars"} ⭐`}
      </p>
      <div className="text-xs font-semibold text-muted-foreground mt-3">— {review.display_name || "A gentle soul"}</div>

      {replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {replies.map((r) => (
            <ReplyRow key={r.id} reply={r} mine={!!user && r.author_id === user.id} onChanged={onReplied} />
          ))}
        </div>
      )}

      {canReply && (
        <div className="mt-3">
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary rounded-full px-3 py-1.5 bg-white/70 border border-white hover:bg-white transition"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Reply
            </button>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Write a kind reply…"
                className="flex-1 text-sm rounded-2xl bg-white/80 border border-white p-2.5 outline-none resize-none"
              />
              <button
                onClick={send}
                disabled={sending || !text.trim()}
                className="rounded-full gradient-pink p-2.5 soft-shadow disabled:opacity-50"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
     </div>
  );
}

function ReplyRow({ reply, mine, onChanged }: { reply: Reply; mine: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply.body);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    const { error } = await supabase.from("review_replies").update({ body }).eq("id", reply.id);
    setBusy(false);
    if (error) { toast.error("Couldn't save that edit."); return; }
    setEditing(false);
    toast.success("Comment updated 💗");
    onChanged();
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("review_replies").delete().eq("id", reply.id);
    setBusy(false);
    if (error) { toast.error("Couldn't delete that comment."); return; }
    toast.success("Comment deleted");
    onChanged();
  };

  return (
    <div className="rounded-2xl bg-white/70 border border-white p-3">
      <div className="text-xs font-semibold text-primary">
        {reply.author_emoji || "💬"} {reply.author_name || "VitaSense AI"}
      </div>
      {editing ? (
        <div className="mt-1.5 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full text-sm rounded-2xl bg-white/80 border border-white p-2.5 outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={busy || !text.trim()} className="text-xs font-semibold rounded-full gradient-pink text-white px-3 py-1.5 disabled:opacity-50">Save</button>
            <button onClick={() => { setEditing(false); setText(reply.body); }} className="text-xs font-semibold rounded-full bg-white/80 border border-white px-3 py-1.5 text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm mt-0.5 leading-relaxed">{reply.body}</div>
          {mine && (
            <div className="flex gap-3 mt-2">
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button onClick={remove} disabled={busy} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
