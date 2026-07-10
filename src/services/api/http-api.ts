import type { Project, BlogPost, Resume, ChatMessage } from "../../types.js";
import type { PortfolioApi } from "./api.interface.js";
import { getDeviceId } from "../device-id.js";

/**
 * REST-backed implementation of `PortfolioApi`. Activated automatically when
 * `VITE_API_BASE_URL` is set. It targets exactly the endpoints named in the
 * specification:
 *
 *   GET  /api/projects
 *   GET  /api/projects/:slug
 *   GET  /api/blog
 *   GET  /api/blog/:slug
 *   GET  /api/resume
 *   GET  /api/visitor-count
 *   POST /api/visitor-count
 *   POST /api/chat            (streaming; text/event-stream or chunked text)
 *
 * This is the only file that needs to change if the backend's transport
 * details differ - the rest of the app is insulated behind `PortfolioApi`.
 */
export class HttpApi implements PortfolioApi {
  constructor(private readonly baseUrl: string) {}

  async getProjects(): Promise<Project[]> {
    return this.getJson<Project[]>("/api/projects");
  }

  async getProject(slug: string): Promise<Project | undefined> {
    return this.getJson<Project>(`/api/projects/${encodeURIComponent(slug)}`).catch(() => undefined);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return this.getJson<BlogPost[]>("/api/blog");
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return this.getJson<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`).catch(() => undefined);
  }

  async getResume(): Promise<Resume> {
    return this.getJson<Resume>("/api/resume");
  }

  async getVisitorCount(): Promise<number> {
    const data = await this.getJson<{ count: number }>("/api/visitor-count");
    return data.count;
  }

  async registerVisit(): Promise<number> {
    // Send a stable device id so the backend can count each device once.
    const res = await fetch(this.url("/api/visitor-count"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: getDeviceId() }),
    });
    if (!res.ok) throw new Error(`registerVisit failed: ${res.status}`);
    const data = (await res.json()) as { count: number };
    return data.count;
  }

  async *chat(messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string> {
    const res = await fetch(this.url("/api/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error(`chat failed: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) yield stripSse(text);
    }
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private async getJson<T>(path: string): Promise<T> {
    const res = await fetch(this.url(path));
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }
}

/** Strip a leading "data: " prefix if the server uses SSE framing. */
function stripSse(chunk: string): string {
  return chunk.replace(/^data:\s?/gm, "").replace(/\n\n$/, "");
}
