/**
 * Serverless chat endpoint — POST /api/chat
 * ============================================================================
 * This runs on the SERVER, not in the browser, so your OpenAI API key stays
 * secret. The browser sends the conversation here; this function adds the
 * system prompt (from src/ai/persona.ts), calls OpenAI, and streams the reply
 * back as plain text.
 *
 * Deploy notes:
 *   - Works on Vercel Edge Functions as-is (this file = the endpoint).
 *   - Set the env var OPENAI_API_KEY in your host's dashboard (NOT in code).
 *   - Netlify/Cloudflare: the handler is a standard (Request) => Response, so
 *     it ports with a thin wrapper — see README.
 * ============================================================================
 */

import { buildSystemPrompt, aiSettings } from "../src/ai/persona.js";

// Tell Vercel to run this on the streaming-friendly Edge runtime.
export const config = { runtime: "edge" };

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = (globalThis as { process?: { env?: Record<string, string> } }).process?.env
    ?.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Server missing OPENAI_API_KEY", { status: 500 });
  }

  let messages: ChatMessage[];
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Keep only the recent turns to cap cost, and sanitize roles.
  const recent = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12);

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
    },
  });
}
