const GATEWAY_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

const MODEL = "gemini-3-flash-preview"

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | ContentBlock[] };

export async function callHavenAI(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_API_KEY");

  const body: Record<string, unknown> = { model: MODEL, messages };
  if (opts?.json) body.response_format = { type: "json_object" };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization":`bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Haven💫 is catching her breath — lots of messages at once. Try again in a few seconds. 💗");
    if (res.status === 402) throw new Error("Haven💫 is out of chat power for now. Top up AI credits with google ai 💗");
    if (res.status === 403) throw new Error("Haven💫's chats are paused right now. Check your AI settings and she'll be back. 💗");
    if (res.status === 400 && /token|length|large|size/i.test(text)) throw new Error("That conversation got a little long for Haven💫 — tap “Start fresh” and she'll pick it back up. 💗");
    if (res.status >= 500) throw new Error("Haven💫 couldn't connect just now — please try again in a moment. 💗");
    throw new Error("Haven💫 couldn't reply just now — please try again in a moment. 💗");
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}
