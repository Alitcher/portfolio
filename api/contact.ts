/**
 * Contact form - POST /api/contact
 * ============================================================================
 * Receives the contact form from the browser and passes it on to the contact
 * backend. The browser only ever talks to this site, so the backend address
 * stays private.
 *
 * Set this SERVER env var in your host's dashboard (never in the client):
 *   CONTACT_BACKEND_URL
 * For local dev, put it in `.env.local`.
 * ============================================================================
 */

export const config = { runtime: "edge" };

// Name 100 + email 254 + message 4000 chars, plus JSON overhead.
const MAX_BODY_BYTES = 16 * 1024;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env ?? {};
  const backendUrl = env.CONTACT_BACKEND_URL;
  if (!backendUrl) return json({ error: "Contact form is not set up yet." }, 500);

  const body = await req.text();
  if (body.length > MAX_BODY_BYTES) return json({ error: "Message is too long." }, 413);

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    // Pass the backend's answer through (202 on success, 400 with { error } on bad input).
    const text = await res.text();
    return new Response(text || null, {
      status: res.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return json({ error: "Contact service is unavailable." }, 502);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
