import { config } from "../config.js";
import { getDeviceId } from "./device-id.js";

/**
 * The AI chat's status for the chat widget: the question limit as reported by
 * /api/chat (see api/chat.ts), and whether the last answer came from the basic
 * offline fallback instead of the real AI (see api.ts).
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
  readonly limit: number;
  /** When the count resets (ms timestamp), or null if no window is running yet. */
  readonly resetAt: number | null;
}

let latest: ChatQuota | null = null;
let offlineAnswer = false;

/** Set by api.ts: was the last answer the basic offline fallback, not the real AI? */
export function setOfflineAnswer(value: boolean): void {
  offlineAnswer = value;
}

export function lastAnswerWasOffline(): boolean {
  return offlineAnswer;
}

const resetAtFrom = (seconds: number) => (seconds > 0 ? Date.now() + seconds * 1000 : null);

// The current 4-hour wait (started by the 5th question), remembered in the
// browser so the countdown survives reloads and keeps running if the AI goes
// offline ("AI back online in 03:12:40"). Set from the server's answers, or by
// countOfflineQuestion() below when the AI is offline.
const LAST_WINDOW_KEY = "alicia.chatLimitWindow";

function remember(q: ChatQuota): void {
  latest = q;
  memoryResetAt = null;
  try {
    if (q.resetAt) localStorage.setItem(LAST_WINDOW_KEY, JSON.stringify({ resetAt: q.resetAt }));
    else localStorage.removeItem(LAST_WINDOW_KEY); // no window running on the server
    localStorage.removeItem("alicia.offlineChatWindow"); // left over from an earlier version
  } catch {
    /* storage blocked */
  }
}

// Fallback when storage is blocked, so the offline countdown still ticks.
let memoryResetAt: number | null = null;

/** When the last known limit window ends (ms timestamp), or null if none is running. */
export function lastWindowResetAt(): number | null {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_WINDOW_KEY) ?? "null") as { resetAt?: unknown } | null;
    if (typeof v?.resetAt === "number") return v.resetAt > Date.now() ? v.resetAt : null;
  } catch {
    /* storage blocked */
  }
  return memoryResetAt && memoryResetAt > Date.now() ? memoryResetAt : null;
}

/**
 * The AI isn't reachable: start the 4-hour wait now, so visitors see at once
 * when it'll be back. Saved like the limit window, so reloads keep the same
 * time. Returns when it ends.
 */
export function startOfflineWait(): number {
  memoryResetAt = Date.now() + WAIT_MS;
  try {
    localStorage.setItem(LAST_WINDOW_KEY, JSON.stringify({ resetAt: memoryResetAt }));
  } catch {
    /* storage blocked - kept in memory only */
  }
  return memoryResetAt;
}

// ---- the same rule while the AI is offline ------------------------------------
// No server to count, so offline questions are counted here: the 5th one starts
// the same 4-hour wait (saved as the window above), and while it runs the chat
// is locked - so nothing typed offline can change the time. Same numbers as
// QUESTIONS_PER_WINDOW / WINDOW_HOURS in api/chat.ts; keep them in step. As soon
// as the real AI is reachable again, its count takes over.
const OFFLINE_LIMIT = 5;
const WAIT_MS = 4 * 60 * 60 * 1000;
const OFFLINE_COUNT_KEY = "alicia.offlineQuestions";

/**
 * Count one offline question (it still gets answered). Throws ChatLimitError if
 * a wait is running; the 5th question starts one.
 */
export function countOfflineQuestion(): void {
  const lockedUntil = lastWindowResetAt();
  if (lockedUntil) throw new ChatLimitError(OFFLINE_LIMIT, WAIT_MS / 3_600_000, Math.ceil((lockedUntil - Date.now()) / 1000));
  try {
    const count = Number(localStorage.getItem(OFFLINE_COUNT_KEY) ?? 0) + 1;
    if (count >= OFFLINE_LIMIT) {
      localStorage.setItem(LAST_WINDOW_KEY, JSON.stringify({ resetAt: Date.now() + WAIT_MS }));
      localStorage.removeItem(OFFLINE_COUNT_KEY);
    } else {
      localStorage.setItem(OFFLINE_COUNT_KEY, String(count));
    }
  } catch {
    /* storage blocked - not counted */
  }
}

/** Called by the chat stream with each answer's response headers. */
export function recordQuota(headers: Headers): void {
  if (!headers.has("X-Questions-Remaining")) return;
  const remaining = Number(headers.get("X-Questions-Remaining"));
  const limit = Number(headers.get("X-Questions-Limit") ?? latest?.limit ?? 5);
  const resetIn = Number(headers.get("X-Questions-Reset"));
  if (Number.isFinite(remaining)) {
    remember({ remaining, limit, resetAt: resetAtFrom(Number.isFinite(resetIn) ? resetIn : 0) });
  }
}

/** Called by the chat stream when the server refuses a question (limit reached). */
export function recordLimitReached(err: ChatLimitError): void {
  remember({ remaining: 0, limit: err.limit, resetAt: resetAtFrom(err.retryAfter) });
}

/**
 * Ask the server how many questions are left, without asking one - so the
 * counter shows before the first question. This doubles as the "is the real AI
 * there?" check for the ONLINE/OFFLINE light: the server only answers it when
 * it's set up (OpenAI key + Redis). Returns false if it isn't reachable; the
 * chat then works in its labelled offline mode, with no limit.
 */
export async function loadQuota(): Promise<boolean> {
  try {
    const res = await fetch(config.chatApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peek: true, deviceId: getDeviceId() }),
    });
    if (!res.ok) return false;
    const q = (await res.json()) as { remaining?: unknown; limit?: unknown; resetIn?: unknown };
    if (typeof q.remaining !== "number" || typeof q.limit !== "number") return false;
    remember({ remaining: q.remaining, limit: q.limit, resetAt: resetAtFrom(Number(q.resetIn) || 0) });
    return true;
  } catch {
    return false; // no server (e.g. a static host) or no network
  }
}

/** The current quota, or null when there's no limit (offline mode / not loaded). */
export function currentQuota(): ChatQuota | null {
  // Once the window is over, the full allowance is back.
  if (latest?.resetAt && Date.now() >= latest.resetAt) {
    latest = { remaining: latest.limit, limit: latest.limit, resetAt: null };
  }
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

/** A ticking countdown clock: "03:59:12". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
