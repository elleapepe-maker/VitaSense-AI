import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function MessagesButton() {
  const [unread, setUnread] = useState(0);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { count } = await supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", uid)
      .is("read_at", null);
    setUnread(count ?? 0);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("dm-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link
      to="/messages"
      className="relative rounded-full p-2 bg-white/70 border border-white hover:bg-white transition"
      aria-label={unread ? `${unread} unread messages` : "Messages"}
    >
      <MessageCircle className="w-4 h-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full gradient-pink text-[10px] font-bold flex items-center justify-center text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}
