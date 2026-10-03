import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Star, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getHavenMemories, deleteHavenMemory } from "@/lib/haven.functions";
import { tapped } from "@/lib/feedback";

export const Route = createFileRoute("/_authenticated/memories")({
  component: Memories,
  head: () => ({
    meta: [
      { title: "What Haven💫 remembers · VitaSense AI" },
      { name: "description", content: "See and edit everything Haven💫 remembers about what helps you feel better." },
      { property: "og:title", content: "What Haven💫 remembers · VitaSense AI" },
      { property: "og:description", content: "See and edit everything Haven💫 remembers about what helps you feel better." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Memory = { id: string; content: string; kind: string | null; created_at: string };

function Memories() {
  const load = useServerFn(getHavenMemories);
  const remove = useServerFn(deleteHavenMemory);
  const [memories, setMemories] = useState<Memory[] | null>(null);

  useEffect(() => {
    load({})
      .then((r) => setMemories((r?.memories ?? []) as Memory[]))
      .catch(() => setMemories([]));
  }, [load]);

  const drop = async (id: string) => {
    tapped();
    setMemories((m) => (m ?? []).filter((x) => x.id !== id));
    try {
      await remove({ data: { id } });
      toast.success("Forgotten 🌸");
    } catch {
      toast.error("Couldn't remove that one");
    }
  };

  return (
    <div className="pt-4 space-y-5">
      <Link to="/chat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Haven💫
      </Link>

      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full gradient-lavender opacity-30 blur-3xl breathe" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <Star className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">What Haven💫 remembers</h1>
            <p className="text-sm text-muted-foreground">Little things she picked up about what helps you. Remove anything you'd rather she forget.</p>
          </div>
        </div>
      </div>

      {memories === null ? (
        <div className="text-center text-muted-foreground animate-pulse py-8">Gathering memories…</div>
      ) : memories.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-4xl mb-2">🫧</div>
          <div className="font-display font-bold text-lg">Nothing saved yet</div>
          <p className="text-sm text-muted-foreground mt-1">Chat with Haven💫 and she'll start remembering what soothes you.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{memories.length} {memories.length === 1 ? "memory" : "memories"} · kept forever unless you remove them</div>
          {memories.map((m) => (
            <div key={m.id} className="glass-card p-4 flex items-start gap-3">
              <span className="text-lg">💗</span>
              <div className="flex-1">
                <p className="text-sm">{m.content}</p>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(m.created_at).toLocaleDateString()} {m.kind ? `· ${m.kind}` : ""}
                </div>
              </div>
              <button onClick={() => drop(m.id)} className="rounded-full p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition" aria-label="Forget this">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
