import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sent } from "@/lib/feedback";
import { Send, MessageCircle, ArrowLeft, Phone, PhoneOff, Mic, Video, VideoOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
  head: () => ({
    meta: [
      { title: "Messages — VitaSense AI" },
      { name: "description", content: "Private messages with the friends you trust on VitaSense AI." },
      { property: "og:title", content: "Messages — VitaSense AI" },
      { property: "og:description", content: "Check in on your friends with private, gentle messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Friend = { id: string; display_name: string | null; username: string | null; avatar_emoji: string | null };
type Msg = { id: string; sender_id: string; recipient_id: string; body: string; read_at: string | null; created_at: string };

type CallState = "idle" | "calling" | "incoming" | "active";

// Simple friend-to-friend voice call using WebRTC audio with a realtime
// channel shared by the two friends for the connection handshake.
function VoiceCall({ me, friend }: { me: string; friend: Friend }) {
  const [state, setState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingOffer = useRef<string | null>(null);
  const pendingIsVideo = useRef(false);
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelName = `call-${[me, friend.id].sort().join("-")}`;

  const send = (payload: Record<string, unknown>) =>
    chanRef.current?.send({ type: "broadcast", event: "sig", payload: { ...payload, from: me } });

  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pendingOffer.current = null;
    pendingIsVideo.current = false;
    setState("idle");
    setMuted(false);
    setIsVideo(false);
    setCameraOff(false);
  };

  useEffect(() => {
    const ch = supabase.channel(channelName);
    ch.on("broadcast", { event: "sig" }, async ({ payload }) => {
      if (payload.from === me) return;
      if (payload.type === "offer") {
        pendingOffer.current = payload.sdp;
        pendingIsVideo.current = !!payload.video;
        setState("incoming");
      } else if (payload.type === "answer" && pcRef.current) {
        await pcRef.current.setRemoteDescription({ type: "answer", sdp: payload.sdp });
        setState("active");
      } else if (payload.type === "candidate" && pcRef.current) {
        try { await pcRef.current.addIceCandidate(payload.candidate); } catch { /* ignore */ }
      } else if (payload.type === "end") {
        cleanup();
        toast.info(`${friend.display_name || "Your friend"} ended the call`);
      }
    }).subscribe();
    chanRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, me]);

  const setupPeer = async (withVideo: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.onicecandidate = (e) => {
      if (e.candidate) send({ type: "candidate", candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && withVideo) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      } else if (audioRef.current) {
        audioRef.current.srcObject = e.streams[0];
        audioRef.current.play().catch(() => {});
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(
      withVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true }
    );
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    streamRef.current = stream;
    if (withVideo && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }
    pcRef.current = pc;
  };

  const startCall = async (withVideo: boolean) => {
    try {
      setIsVideo(withVideo);
      await setupPeer(withVideo);
      const offer = await pcRef.current!.createOffer();
      await pcRef.current!.setLocalDescription(offer);
      send({ type: "offer", sdp: offer.sdp, video: withVideo });
      setState("calling");
    } catch {
      toast.error(
        withVideo
          ? "Couldn't start the video call — check your camera & microphone permissions."
          : "Couldn't start the call — check your microphone permission."
      );
      cleanup();
    }
  };

  const acceptCall = async () => {
    try {
      const withVideo = pendingIsVideo.current;
      setIsVideo(withVideo);
      await setupPeer(withVideo);
      await pcRef.current!.setRemoteDescription({ type: "offer", sdp: pendingOffer.current! });
      const answer = await pcRef.current!.createAnswer();
      await pcRef.current!.setLocalDescription(answer);
      send({ type: "answer", sdp: answer.sdp });
      setState("active");
    } catch {
      toast.error("Couldn't join the call — check your microphone permission.");
      cleanup();
    }
  };

  const endCall = () => {
    send({ type: "end" });
    cleanup();
  };

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOff(!track.enabled);
    }
  };

  const name = friend.display_name || "Friend";

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      {state === "idle" && (
        <>
          <button
            onClick={() => startCall(false)}
            className="rounded-full gradient-pink p-2.5 soft-shadow"
            aria-label={`Voice call ${name}`}
          >
            <Phone className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => startCall(true)}
            className="rounded-full gradient-pink p-2.5 soft-shadow"
            aria-label={`Video call ${name}`}
          >
            <Video className="w-4 h-4 text-white" />
          </button>
        </>
      )}
      {isVideo && state !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-3xl bg-black aspect-[3/4] object-cover" />
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-3 right-3 w-24 rounded-2xl border-2 border-white/70 bg-black aspect-[3/4] object-cover" />
            {state !== "active" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="glass-card px-4 py-2 text-sm font-bold text-foreground animate-pulse">
                  {state === "calling" ? `Video calling ${name}… 📹` : `${name} is video calling you 💗`}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {state === "incoming" ? (
                <>
                  <button onClick={acceptCall} className="rounded-full gradient-pink px-4 py-2 text-white text-sm font-bold">Answer</button>
                  <button onClick={endCall} className="rounded-full bg-red-500 text-white p-2.5" aria-label="Decline call">
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`rounded-full p-2.5 ${muted ? "bg-white text-black" : "bg-white/25 text-white"}`}
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleCamera}
                    className={`rounded-full p-2.5 ${cameraOff ? "bg-white text-black" : "bg-white/25 text-white"}`}
                    aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
                  >
                    {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                  <button onClick={endCall} className="rounded-full bg-red-500 text-white p-2.5" aria-label="End call">
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {state !== "idle" && !isVideo && (
        <div className="glass-card px-3 py-2 flex items-center gap-2 text-xs font-semibold">
          {state === "calling" && <span className="animate-pulse">Calling {name}… 📞</span>}
          {state === "incoming" && <span className="animate-pulse">{name} is calling you 💗</span>}
          {state === "active" && <span>On a call with {name} 🎧</span>}
          {state === "incoming" && (
            <button onClick={acceptCall} className="rounded-full gradient-pink px-3 py-1.5 text-white">Answer</button>
          )}
          {(state === "active" || state === "calling") && (
            <button
              onClick={toggleMute}
              className={`rounded-full px-2.5 py-1.5 border ${muted ? "bg-foreground text-background" : "bg-white/70 border-white"}`}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={endCall} className="rounded-full bg-red-500 text-white p-1.5" aria-label="End call">
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function MessagesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [active, setActive] = useState<Friend | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("direct_messages")
      .select("id, sender_id, recipient_id, body, read_at, created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    setMessages((data ?? []) as Msg[]);
  };

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      setMe(uid);
      if (!uid) return;

      const { data: fr } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id, status")
        .eq("status", "accepted");
      const ids = new Set(
        (fr ?? []).map((f) => (f.requester_id === uid ? f.addressee_id : f.requester_id))
      );

      // Also include anyone we already have a private chat with (for example,
      // people whose rating you replied to) so those threads show up here too.
      const { data: dms } = await supabase
        .from("direct_messages")
        .select("sender_id, recipient_id");
      (dms ?? []).forEach((d) => {
        ids.add(d.sender_id === uid ? d.recipient_id : d.sender_id);
      });
      ids.delete(uid);

      if (ids.size > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_emoji")
          .in("id", Array.from(ids));
        const found = (profs ?? []) as Friend[];
        const missing = Array.from(ids)
          .filter((id) => !found.some((p) => p.id === id))
          .map((id) => ({ id, display_name: "VitaSense friend", username: null, avatar_emoji: "🌸" }));
        setFriends([...found, ...missing]);
      }
      await loadMessages();
      setLoading(false);

    })();

    const channel = supabase
      .channel("my-dms")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => loadMessages())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const thread = useMemo(
    () => (active ? messages.filter((m) => m.sender_id === active.id || m.recipient_id === active.id) : []),
    [messages, active]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  // mark the open thread as read
  useEffect(() => {
    if (!active || !me) return;
    const unread = thread.filter((m) => m.recipient_id === me && !m.read_at).map((m) => m.id);
    if (unread.length === 0) return;
    supabase
      .from("direct_messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread)
      .then(() => loadMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, thread.length, me]);

  const unreadFrom = (fid: string) => messages.filter((m) => m.sender_id === fid && !m.read_at).length;
  const lastWith = (fid: string) => {
    const list = messages.filter((m) => m.sender_id === fid || m.recipient_id === fid);
    return list[list.length - 1];
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !active || !me) return;
    setSending(true);
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: me,
      recipient_id: active.id,
      body,
    });
    setSending(false);
    if (error) {
      toast.error(
        "That message didn't go through. Check your connection and try again 💗"
      );
      return;
    }
    sent();
    setText("");
    loadMessages();
  };

  return (
    <div className="pt-4 pb-8 space-y-5">
      <div className="flex items-center gap-2">
        {active && (
          <button onClick={() => setActive(null)} className="rounded-full p-2 bg-white/70 border border-white" aria-label="Back to all chats">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold">
            {active ? `${active.avatar_emoji || "🌸"} ${active.display_name || "Friend"}` : "Messages 💬"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {active ? "Private between the two of you 💗" : "Chat privately with friends you've added."}
          </p>
        </div>
        {active && me && (
          <div className="ml-auto">
            <VoiceCall me={me} friend={active} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center animate-pulse">Loading...</div>
      ) : !active ? (
        <div className="glass-card p-5">
          {friends.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No friends yet — add someone on the Friends page and you can message them here 🌸
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => {
                const last = lastWith(f.id);
                const unread = unreadFrom(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setActive(f)}
                    className="w-full text-left flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white hover:bg-white transition"
                  >
                    <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center text-lg">{f.avatar_emoji || "🌸"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{f.display_name || "Friend"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {last ? `${last.sender_id === me ? "You: " : ""}${last.body}` : "Say hi 💗"}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full gradient-pink text-white text-[11px] font-bold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-4 flex flex-col">
          <div className="max-h-[52vh] overflow-y-auto space-y-2 pr-1">
            {thread.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6 flex flex-col items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                No messages yet — send the first one 💗
              </div>
            )}
            {thread.map((m) => {
              const mine = m.sender_id === me;
              const senderLabel = mine ? "Me" : active.display_name || "Friend";
              // Rating replies are stored as "↩ ⭐⭐⭐⭐⭐\n<their rating>\n\n<the reply>"
              const isQuote = m.body.startsWith("↩ ");
              let quoteHead = "";
              let quoteBody = "";
              let replyBody = m.body;
              if (isQuote) {
                const [head, ...rest] = m.body.slice(2).split("\n");
                quoteHead = head;
                const joined = rest.join("\n");
                const split = joined.indexOf("\n\n");
                quoteBody = split >= 0 ? joined.slice(0, split) : joined;
                replyBody = split >= 0 ? joined.slice(split + 2) : "";
              }
              // The quoted rating always belongs to whoever received this reply.
              const quoteLabel = m.recipient_id === me ? "Me" : active.display_name || "Friend";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      mine ? "gradient-pink text-white soft-shadow" : "bg-white/80 border border-white"
                    }`}
                  >
                    {isQuote ? (
                      <>
                        <div
                          className={`rounded-xl px-2.5 py-2 mb-2 border-l-2 ${
                            mine ? "bg-white/20 border-white/70" : "bg-black/5 border-primary/60"
                          }`}
                        >
                          <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${mine ? "text-white/85" : "text-muted-foreground"}`}>
                            {quoteLabel}
                          </div>
                          <div className="whitespace-pre-wrap">{quoteHead}{quoteBody ? `\n${quoteBody}` : ""}</div>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${mine ? "text-white/85" : "text-muted-foreground"}`}>
                          {senderLabel}
                        </div>
                        <div className="whitespace-pre-wrap">{replyBody}</div>
                      </>
                    ) : (
                      <>
                        <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${mine ? "text-white/85" : "text-muted-foreground"}`}>
                          {senderLabel}
                        </div>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                      </>
                    )}
                    <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {mine && (m.read_at ? " · Seen ✓✓" : " · Sent ✓")}

                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={endRef} />
          </div>

          <div className="flex items-end gap-2 mt-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Write something kind…"
              className="flex-1 text-sm rounded-2xl bg-white/80 border border-white p-2.5 outline-none resize-none"
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="rounded-full gradient-pink p-3 soft-shadow disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
