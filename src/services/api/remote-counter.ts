/**
 * Client for our own /api/visitor-count serverless endpoint (backed by Upstash
 * Redis). The endpoint counts UNIQUE device ids, so:
 *
 *   GET  {url}                 -> { count }   read the global unique-device total
 *   POST {url} { deviceId }    -> { count }   register this device (idempotent)
 *
 * Registering the same device twice does not change the total, so a page reload
 * by the same visitor leaves the number untouched.
 */
export async function fetchVisitorCount(url: string): Promise<number> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`getVisitorCount failed: ${res.status}`);
  const data = (await res.json()) as { count: number };
  return data.count;
}

export async function registerVisitRemote(url: string, deviceId: string): Promise<number> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });
  if (!res.ok) throw new Error(`registerVisit failed: ${res.status}`);
  const data = (await res.json()) as { count: number };
  return data.count;
}
