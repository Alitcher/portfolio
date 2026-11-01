/**
 * Contact form - POST /api/contact
 * ============================================================================
 * Receives the contact form from the browser and passes it on to the contact
 * backend. The browser only ever talks to this site, so the backend address
 * stays private.
 *
 * Spam limit: at most MAX_PER_WINDOW sent messages per IP per WINDOW_SECONDS,
 * counted in the same Upstash Redis as the chat and visitor counter. If Redis
 * is not set up or not reachable, the limit is skipped so the form still works.
 *
 * Set these SERVER env vars in your host's dashboard (never in the client):
 *   CONTACT_BACKEND_URL
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     (or KV_REST_API_URL + KV_REST_API_TOKEN)
 * For local dev, put them in `.env.local`.
 * ============================================================================
 */

export const config = { runtime: "edge" };

// Name 100 + email 254 + message 4000 chars, plus JSON overhead.
const MAX_BODY_BYTES = 16 * 1024;

const MAX_PER_WINDOW = 3;
const WINDOW_SECONDS = 10 * 60;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env ?? {};
  const backendUrl = env.CONTACT_BACKEND_URL;
  if (!backendUrl) return json({ error: "Contact form is not set up yet." }, 500);

  const redisUrl = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const limitKey = `contact:ip:${ip}`;

  // Check the limit before sending anything on.
  if (redisUrl && redisToken) {
    try {
      const [count, ttl] = await redisPipeline(redisUrl, redisToken, [["GET", limitKey], ["TTL", limitKey]]);
      if (Number(count ?? 0) >= MAX_PER_WINDOW) {
        const wait = Math.max(1, Number(ttl) || WINDOW_SECONDS);
        return json(
          { error: `Too many messages. Please try again in ${Math.ceil(wait / 60)} minutes.` },
          429,
          { "Retry-After": String(wait) },
        );
      }
    } catch {
      // Redis unavailable: skip the limit rather than block real visitors.
    }
  }

  const body = await req.text();
  if (body.length > MAX_BODY_BYTES) return json({ error: "Message is too long." }, 413);

  let res: Response;
  try {
    res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return json({ error: "Contact service is unavailable." }, 502);
  }

  // Count only messages that were accepted, so typos (400) don't use up the limit.
  if (res.ok && redisUrl && redisToken) {
    try {
      await redisPipeline(redisUrl, redisToken, [
        ["SET", limitKey, "0", "EX", String(WINDOW_SECONDS), "NX"],
        ["INCR", limitKey],
      ]);
    } catch {
      // Not counted this time; the message itself was still sent.
    }
  }

  // Pass the backend's answer through (202 on success, 400 with { error } on bad input).
  const text = await res.text();
  return new Response(text || null, {
    status: res.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
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

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extraHeaders },
  });
}
