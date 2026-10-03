import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationBell() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setNotes((data ?? []) as Note[]);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("my-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const n = payload.new as Note;
        toast(n.title, { description: n.body ?? undefined, duration: 7000 });
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unread = notes.filter((n) => !n.read_at).length;

  const markAllRead = async () => {
    const ids = notes.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative rounded-full p-2 bg-white/70 border border-white hover:bg-white transition"
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full gradient-pink text-[10px] font-bold flex items-center justify-center text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto glass-card p-3 z-50 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground px-1">Notifications</div>
          {notes.length === 0 ? (
            <div className="text-sm text-muted-foreground px-1 py-2">Nothing new yet 💗</div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="rounded-2xl bg-white/70 border border-white p-2.5">
                <div className="text-sm font-semibold">{n.title}</div>
                {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
