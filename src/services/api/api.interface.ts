import type { Project, BlogPost, Resume, ChatMessage } from "../../types.js";

/**
 * The single data contract for the whole application.
 *
 * Pages and components depend ONLY on this interface - never on a concrete
 * implementation. Today it is fulfilled by `LocalApi` (bundled mock data);
 * pointing `VITE_API_BASE_URL` at a server swaps in `HttpApi` with zero UI
 * changes. This is what keeps the frontend "backend-ready".
 */
export interface PortfolioApi {
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | undefined>;

  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;

  getResume(): Promise<Resume>;

  getVisitorCount(): Promise<number>;
  /** Register this visit and return the new total. */
  registerVisit(): Promise<number>;

  /**
   * Stream an assistant reply as a sequence of text chunks. Implementations
   * may yield token-by-token (local) or forward SSE chunks (remote).
   */
  chat(messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string>;
}
