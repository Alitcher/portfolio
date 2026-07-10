/**
 * Serverless visitor counter — GET/POST /api/visitor-count
 * ============================================================================
 * A REAL, global visitor count that counts each DEVICE once (not each request).
 *
 * Storage is an Upstash Redis SET of anonymous device ids:
 *   POST { deviceId }  ->  SADD visitors:devices <id>  (idempotent)  ->  { count }
 *   GET                ->  SCARD visitors:devices                     ->  { count }
 *
 * Because SADD ignores ids already in the set, a returning visitor — no matter
 * how many times they reload — never changes the total. SCARD is the number of
 * distinct devices that have ever visited.
 *
 * Deploy notes (Vercel/Netlify — NOT GitHub Pages, which has no server):
 *   - Create a free Upstash Redis database (https://upstash.com).
 *   - Set these SERVER env vars in your host's dashboard (never in the client):
 *       UPSTASH_REDIS_REST_URL
 *       UPSTASH_REDIS_REST_TOKEN
 *   - Point the frontend at it with VITE_COUNTER_API_URL=/api/visitor-count.
 * ============================================================================
 */

// Runs on the edge runtime, same as /api/chat.
export const config = { runtime: "edge" };

const SET_KEY = "visitors:devices";

export default async function handler(req: Request): Promise<Response> {
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env ?? {};
  const restUrl = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !token) {
    return json({ error: "Server missing Upstash config" }, 500);
  }

  try {
    if (req.method === "GET") {
      const count = await redis(restUrl, token, ["SCARD", SET_KEY]);
      return json({ count: toCount(count) });
    }

    if (req.method === "POST") {
      let deviceId = "";
      try {
        const body = (await req.json()) as { deviceId?: unknown };
        deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
      } catch {
        /* fall through to validation */
      }
      // Accept only our own id shape and cap the length to prevent abuse of the set.
      if (!/^[A-Za-z0-9-]{8,64}$/.test(deviceId)) {
        return json({ error: "invalid deviceId" }, 400);
      }
      // Idempotent: SADD does nothing if the device is already counted.
      await redis(restUrl, token, ["SADD", SET_KEY, deviceId]);
      const count = await redis(restUrl, token, ["SCARD", SET_KEY]);
      return json({ count: toCount(count) });
    }

    return json({ error: "Method Not Allowed" }, 405);
  } catch (err) {
    return json({ error: `counter unavailable: ${(err as Error).message}` }, 502);
  }
}

/** Run one Redis command through the Upstash REST API. */
async function redis(url: string, token: string, command: string[]): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = (await res.json().catch(() => ({}))) as { result?: unknown; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
  return data.result;
}

function toCount(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
