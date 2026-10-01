import type { ChatMessage } from "../../types.js";
import { getDeviceId } from "../device-id.js";
import { ChatLimitError, recordQuota, recordLimitReached } from "../chat-quota.js";

/**
 * Streams an assistant reply from our own /api/chat serverless endpoint.
 *
 * The endpoint already emits plain text (it converts OpenAI's SSE frames into
 * bare tokens), so here we just decode and yield each chunk as it arrives.
 * It also enforces the question limit per device, so the anonymous device id
 * goes along with every question; a 429 means the limit is used up.
 */
export async function* streamChatFrom(
  url: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncIterable<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, deviceId: getDeviceId() }),
    signal,
  });

  if (res.status === 429) {
    const info = (await res.json().catch(() => ({}))) as { limit?: number; windowHours?: number; retryAfter?: number };
    const err = new ChatLimitError(info.limit ?? 5, info.windowHours ?? 4, info.retryAfter ?? 0);
    recordLimitReached(err);
    throw err;
  }
  if (!res.ok || !res.body) {
    throw new Error(`chat failed: ${res.status}`);
  }
  recordQuota(res.headers);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) yield text;
  }
}
