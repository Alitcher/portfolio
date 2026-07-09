import type { ChatMessage } from "../../types.js";

/**
 * Streams an assistant reply from our own /api/chat serverless endpoint.
 *
 * The endpoint already emits plain text (it converts OpenAI's SSE frames into
 * bare tokens), so here we just decode and yield each chunk as it arrives.
 */
export async function* streamChatFrom(
  url: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncIterable<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`chat failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) yield text;
  }
}
