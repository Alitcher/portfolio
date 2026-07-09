# AliciaAI — Setup Guide

The `:: AI ASSISTANT ::` chat can run in two modes:

| Mode | When | What you get |
|------|------|--------------|
| **Mock** (default) | `VITE_CHAT_API_URL` empty | Built-in canned replies, no key, works offline |
| **OpenAI** | `VITE_CHAT_API_URL=/api/chat` + `OPENAI_API_KEY` set on the server | Real AI answers streamed from OpenAI |

Your OpenAI key **never** touches the browser — it lives only on the server (the
`api/chat.ts` function).

---

## ✏️ To change what the AI says / its rules

Edit **`src/ai/persona.ts`** — that one file. It's plain English in labelled
sections: identity, knowledge, rules, style, boundaries. Change the text, save,
redeploy. You can also switch the model (`gpt-4o-mini` → `gpt-4o`) and
temperature at the bottom of that file.

---

## 🚀 Deploy on Vercel (recommended, easiest)

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
   Vercel auto-detects Vite and serves `api/chat.ts` as a function — no config.
2. In **Project → Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your secret key (`sk-...`)
   - `VITE_CHAT_API_URL` = `/api/chat`
3. Deploy. Open the site, ask the assistant something — it should stream a reply.

## 🧪 Test locally with the real AI

`npm run dev` alone runs the frontend but **not** the `/api` function, so the
chat stays in mock mode. To exercise the real endpoint locally:

```bash
npm i -g vercel
# create .env.local with:
#   OPENAI_API_KEY=sk-...
#   VITE_CHAT_API_URL=/api/chat
vercel dev
```

## 🌐 Deploy on Netlify instead

Netlify puts functions in `netlify/functions/`. Either move `api/chat.ts` there
(rename the export to a named `handler`) or add a redirect in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/chat"
  to = "/.netlify/functions/chat"
  status = 200
```

The handler body is a standard `(Request) => Response`, so it ports directly;
just set `OPENAI_API_KEY` and `VITE_CHAT_API_URL=/api/chat` in Netlify's env.

---

## 💡 Want to use Claude instead of OpenAI?

The function is a thin wrapper. Swap the OpenAI `fetch` call in `api/chat.ts`
for Anthropic's `/v1/messages` endpoint and set `ANTHROPIC_API_KEY` instead —
the persona template and the whole frontend stay exactly the same. Ask me and
I'll do it.

## 💰 Cost & safety notes

- `gpt-4o-mini` is very cheap; each visitor question costs a fraction of a cent.
- Replies are capped (`maxTokens`) and only the last 12 turns are sent, to
  bound cost. Consider adding rate limiting before sharing the site widely.
