/**
 * Serverless chat endpoint — POST /api/chat
 * ============================================================================
 * This runs on the SERVER, not in the browser, so your OpenAI API key stays
 * secret. The browser sends the conversation here; this function adds the
 * system prompt (from src/ai/persona.ts), calls OpenAI, and streams the reply
 * back as plain text.
 *
 * Question limit: each visitor may ask QUESTIONS_PER_WINDOW questions; the one
 * that uses up the last question starts a WINDOW_HOURS lock, counted from that
 * moment, during which they're refused (with the exact time left). When the lock
 * ends they get a fresh QUESTIONS_PER_WINDOW. It's enforced here on the server
 * (the browser can't skip it), counted in the same Upstash Redis database as the
 * visitor counter:
 *   - per device: the anonymous device id the site already uses for the
 *     visitor counter (see src/services/device-id.ts).
 *   - per IP address, with a higher cap: clearing browser storage gives a new
 *     device id, so this stops one person from resetting their limit endlessly
 *     while still letting a few people on the same Wi-Fi each ask their questions.
 * Counts of questions that never reach the limit are forgotten after COUNT_TTL_HOURS.
 *
 * Deploy notes:
 *   - Works on Vercel Edge Functions as-is (this file = the endpoint).
 *   - Set these env vars in your host's dashboard (NOT in code):
 *       OPENAI_API_KEY
 *       UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *         (or KV_REST_API_URL + KV_REST_API_TOKEN, which Vercel's Upstash
 *         integration sets for you)
 *   - Without the Redis vars the chat refuses to run, rather than run unlimited.
 *   - Netlify/Cloudflare: the handler is a standard (Request) => Response, so
 *     it ports with a thin wrapper — see README.
 * ============================================================================
 */

import { buildSystemPrompt, aiSettings } from "../src/ai/persona.js";

// Tell Vercel to run this on the streaming-friendly Edge runtime.
export const config = { runtime: "edge" };

const QUESTIONS_PER_WINDOW = 5;
const WINDOW_HOURS = 4;
/** Per-IP cap for the same window (see the header comment). */
const QUESTIONS_PER_IP = 20;
/** Unused questions (limit never reached) are forgotten after this long. */
const COUNT_TTL_HOURS = 24;
/** Longest message accepted, in characters - keeps a single request's cost bounded. */
const MAX_MESSAGE_CHARS = 2000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env ?? {};
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Server missing OPENAI_API_KEY", { status: 500 });
  }
  const redisUrl = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!redisUrl || !redisToken) {
    return new Response("Server missing Upstash config (needed for the question limit)", { status: 500 });
  }

  let messages: ChatMessage[];
  let deviceId = "";
  let peek = false;
  try {
    const body = (await req.json()) as { messages?: ChatMessage[]; deviceId?: unknown; peek?: unknown };
    messages = Array.isArray(body.messages) ? body.messages : [];
    deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    peek = body.peek === true;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  // Same id shape the visitor counter accepts.
  if (!/^[A-Za-z0-9-]{8,64}$/.test(deviceId)) {
    return new Response("invalid deviceId", { status: 400 });
  }

  const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const deviceKey = `chat:device:${deviceId}`;
  const ipKey = `chat:ip:${ip}`;

  const keys = { deviceKey, ipKey, deviceLock: `${deviceKey}:lock`, ipLock: `${ipKey}:lock` };

  let state: LimitState;
  try {
    state = await readLimit(redisUrl, redisToken, keys);
  } catch (err) {
    return new Response(`Question limit unavailable: ${(err as Error).message}`, { status: 502 });
  }

  // { peek: true }: only report how many questions are left (for the counter the
  // chat shows before the first question). Asks nothing, counts nothing.
  if (peek) {
    return jsonResponse({
      limit: QUESTIONS_PER_WINDOW,
      remaining: state.lockedFor > 0 ? 0 : Math.max(0, QUESTIONS_PER_WINDOW - state.deviceCount),
      // seconds until the lock ends; 0 = not locked
      resetIn: state.lockedFor,
    });
  }

  // Keep only the recent turns to cap cost, and sanitize roles.
  const recent = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (recent[recent.length - 1]?.role !== "user") {
    return new Response("The last message must be the visitor's question", { status: 400 });
  }

  // ---- question limit ------------------------------------------------------
  // Locked (the last question was used up less than WINDOW_HOURS ago): refuse,
  // with the exact time left. Refused tries aren't counted.
  if (state.lockedFor > 0) {
    return new Response(
      JSON.stringify({ error: "limit", limit: QUESTIONS_PER_WINDOW, windowHours: WINDOW_HOURS, retryAfter: state.lockedFor }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(state.lockedFor), "Cache-Control": "no-store" },
      },
    );
  }
  let quota: Quota;
  try {
    quota = await countQuestion(redisUrl, redisToken, keys);
  } catch (err) {
    return new Response(`Question limit unavailable: ${(err as Error).message}`, { status: 502 });
  }

  // Optional OPENAI_BASE_URL: an OpenAI-compatible endpoint instead (e.g. a proxy).
  const openaiBase = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const openaiRes = await fetch(`${openaiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: aiSettings.model,
      temperature: aiSettings.temperature,
      max_tokens: aiSettings.maxTokens,
      stream: true,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...recent],
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    // Our fault, not theirs: give the question back.
    await refundQuestion(redisUrl, redisToken, keys, quota).catch(() => {});
    const detail = await openaiRes.text().catch(() => "");
    return new Response(`Upstream error ${openaiRes.status}: ${detail}`, { status: 502 });
  }

  // Transform OpenAI's SSE stream into a plain-text token stream the browser
  // can append directly.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = openaiRes.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by blank lines; each "data:" line holds JSON.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload);
              const token: string | undefined = json.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              /* ignore keep-alive / partial frames */
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Lets the chat widget show "n questions left".
      "X-Questions-Remaining": String(quota.deviceLocked ? 0 : Math.max(0, QUESTIONS_PER_WINDOW - quota.deviceCount)),
      // seconds until they can ask again: the WINDOW_HOURS lock if this was the last question, else 0
      "X-Questions-Reset": String(quota.deviceLocked ? WINDOW_HOURS * 3600 : 0),
      "X-Questions-Limit": String(QUESTIONS_PER_WINDOW),
    },
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// ---- Upstash Redis (REST) ----------------------------------------------------

// Per device and per IP: a question count, plus a lock key that exists for
// WINDOW_HOURS after the last allowed question was used.
interface LimitKeys {
  deviceKey: string;
  ipKey: string;
  deviceLock: string;
  ipLock: string;
}

interface LimitState {
  deviceCount: number;
  /** Seconds left on whichever lock (device or IP) runs longest; 0 = not locked. */
  lockedFor: number;
}

async function readLimit(url: string, token: string, k: LimitKeys): Promise<LimitState> {
  const r = await redisPipeline(url, token, [["GET", k.deviceKey], ["TTL", k.deviceLock], ["TTL", k.ipLock]]);
  return { deviceCount: Number(r[0] ?? 0), lockedFor: Math.max(0, Number(r[1]), Number(r[2])) };
}

interface Quota {
  deviceCount: number;
  /** This question used up the device's last one: the lock starts now. */
  deviceLocked: boolean;
  ipLocked: boolean;
}

/**
 * Count one question. When a count reaches its cap, that question is still
 * answered, and the lock starts right then (WINDOW_HOURS from this moment) and
 * the count starts over for after the lock.
 */
async function countQuestion(url: string, token: string, k: LimitKeys): Promise<Quota> {
  const keep = String(COUNT_TTL_HOURS * 3600);
  const r = await redisPipeline(url, token, [
    ["SET", k.deviceKey, "0", "EX", keep, "NX"],
    ["INCR", k.deviceKey],
    ["SET", k.ipKey, "0", "EX", keep, "NX"],
    ["INCR", k.ipKey],
  ]);
  const deviceCount = Number(r[1]), ipCount = Number(r[3]);
  const quota = { deviceCount, deviceLocked: deviceCount >= QUESTIONS_PER_WINDOW, ipLocked: ipCount >= QUESTIONS_PER_IP };
  const lock = String(WINDOW_HOURS * 3600);
  const commands: string[][] = [];
  if (quota.deviceLocked) commands.push(["SET", k.deviceLock, "1", "EX", lock], ["DEL", k.deviceKey]);
  if (quota.ipLocked) commands.push(["SET", k.ipLock, "1", "EX", lock], ["DEL", k.ipKey]);
  if (commands.length) await redisPipeline(url, token, commands);
  return quota;
}

/** OpenAI failed: give the question back (and undo a lock it started). */
async function refundQuestion(url: string, token: string, k: LimitKeys, q: Quota): Promise<void> {
  const keep = String(COUNT_TTL_HOURS * 3600);
  await redisPipeline(url, token, [
    ...(q.deviceLocked
      ? [["DEL", k.deviceLock], ["SET", k.deviceKey, String(QUESTIONS_PER_WINDOW - 1), "EX", keep]]
      : [["DECR", k.deviceKey]]),
    ...(q.ipLocked
      ? [["DEL", k.ipLock], ["SET", k.ipKey, String(QUESTIONS_PER_IP - 1), "EX", keep]]
      : [["DECR", k.ipKey]]),
  ]);
}

/** Run several Redis commands in one round trip through Upstash's /pipeline endpoint. */
async function redisPipeline(url: string, token: string, commands: string[][]): Promise<unknown[]> {
  const res = await fetch(`${url.replace(/\/+$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  const data = (await res.json().catch(() => null)) as { result?: unknown; error?: string }[] | null;
  if (!res.ok || !Array.isArray(data)) throw new Error(`Redis HTTP ${res.status}`);
  const failed = data.find((d) => d.error);
  if (failed) throw new Error(failed.error);
  return data.map((d) => d.result);
}
