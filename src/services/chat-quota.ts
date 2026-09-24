/**
 * The AI chat's question limit, as reported by /api/chat (see api/chat.ts).
 * Only the real OpenAI mode has a limit; the offline mock never sets this.
 */

/** Thrown by the chat stream when the visitor has used up their questions. */
export class ChatLimitError extends Error {
  constructor(
    readonly limit: number,
    readonly windowHours: number,
    /** Seconds until they can ask again. */
    readonly retryAfter: number,
  ) {
    super("question limit reached");
  }
}

export interface ChatQuota {
  readonly remaining: number;
  /** Seconds until the count resets. */
  readonly resetIn: number;
}

let latest: ChatQuota | null = null;

/** Called by the chat stream with each answer's response headers. */
export function recordQuota(headers: Headers): void {
  const remaining = Number(headers.get("X-Questions-Remaining"));
  const resetIn = Number(headers.get("X-Questions-Reset"));
  if (headers.has("X-Questions-Remaining") && Number.isFinite(remaining)) {
    latest = { remaining, resetIn: Number.isFinite(resetIn) ? resetIn : 0 };
  }
}

/** The quota after the most recent answer, or null when there's no limit (mock mode). */
export function latestQuota(): ChatQuota | null {
  return latest;
}

/** "3 h 20 min" / "12 min" / "less than a minute". */
export function formatWait(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  if (mins < 1) return "less than a minute";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
