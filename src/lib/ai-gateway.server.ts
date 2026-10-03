// Server-only helpers to call Lovable AI Gateway.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | ContentBlock[] };

export async function callLovableAI(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const body: Record<string, unknown> = { model: MODEL, messages };
  if (opts?.json) body.response_format = { type: "json_object" };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Haven💫 is catching her breath — lots of messages at once. Try again in a few seconds. 💗");
    if (res.status === 402) throw new Error("Haven💫 is out of chat power for now. Top up AI credits in Lovable and she'll be right back. 💗");
    if (res.status === 403) throw new Error("Haven💫's chats are paused right now. Check your AI settings and she'll be back. 💗");
    if (res.status === 400 && /token|length|large|size/i.test(text)) throw new Error("That conversation got a little long for Haven💫 — tap “Start fresh” and she'll pick it back up. 💗");
    if (res.status >= 500) throw new Error("Haven💫 couldn't connect just now — please try again in a moment. 💗");
    throw new Error("Haven💫 couldn't reply just now — please try again in a moment. 💗");
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}
