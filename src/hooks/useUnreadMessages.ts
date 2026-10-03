import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live count of unread direct_messages for the current user.
 * Subscribes to realtime changes so the badge updates instantly.
 */
export function useUnreadMessages() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let uid: string | null = null;

    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      uid = auth.user?.id ?? null;
      if (!uid) {
        setUnread(0);
        return;
      }
      const { count } = await supabase
        .from("direct_messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", uid)
        .is("read_at", null);
      setUnread(count ?? 0);
    };

    load();

    const channel = supabase
      .channel("unread-dm-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages" },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return unread;
}
