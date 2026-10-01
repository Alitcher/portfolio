// Runs the Vercel functions in api/ (e.g. /api/chat, /api/visitor-count) inside
// `npm run dev`, so the real AI works locally too - without it the dev server has
// no /api and the chat could only ever use its offline fallback.
//
// Keys come from .env.local (never committed): OPENAI_API_KEY and the Upstash
// Redis URL/token, same names as on Vercel - see AI-SETUP.md. Without them the
// function answers with an error and the chat falls back, labelled as such.
//
// Dev only (`apply: "serve"`): Vercel runs these files itself in production.
import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import { loadEnv, type Plugin } from "vite";

const SERVER_ENV = [
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
];

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      // The functions read process.env, like on Vercel. Only the server-side
      // secrets are copied - they never reach the browser bundle.
      const env = loadEnv(server.config.mode, root, "");
      for (const key of SERVER_ENV) if (env[key] && !process.env[key]) process.env[key] = env[key];

      server.middlewares.use("/api", async (req, res, next) => {
        const name = (req.url ?? "").split("?")[0]!.replace(/^\/+|\/+$/g, "");
        const file = path.join(root, "api", `${name}.ts`);
        if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) return next();
        try {
          const mod = (await server.ssrLoadModule(file)) as { default: (r: Request) => Promise<Response> };
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string" && !["host", "connection", "content-length"].includes(k)) headers.set(k, v);
          }
          headers.set("x-real-ip", req.socket.remoteAddress ?? "127.0.0.1");
          const hasBody = req.method !== "GET" && req.method !== "HEAD";
          const request = new Request(`http://${req.headers.host}${req.originalUrl ?? req.url}`, {
            method: req.method,
            headers,
            body: hasBody ? new Uint8Array(await readBody(req)) : undefined,
          });
          const response = await mod.default(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          if (response.body) {
            // Pass the stream through chunk by chunk, so the chat still types live.
            for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
          }
          res.end();
        } catch (err) {
          server.config.logger.error(`[dev-api] /api/${name}: ${(err as Error).message}`);
          res.statusCode = 500;
          res.end(`dev-api error: ${(err as Error).message}`);
        }
      });
    },
  };
}
