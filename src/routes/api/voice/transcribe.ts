import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/voice/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const inbound = await request.formData();
        const file = inbound.get("file");
        if (!(file instanceof File)) return new Response("Missing file", { status: 400 });

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, file.name || "recording.webm");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(text || "Transcription failed", { status: res.status });
        }
        const json = await res.json();
        return Response.json({ text: json.text ?? "" });
      },
    },
  },
});
