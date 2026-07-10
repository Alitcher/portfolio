import type { Project, BlogPost, Resume, ChatMessage } from "../../types.js";
import type { PortfolioApi } from "./api.interface.js";
import { PROJECTS } from "../data/projects.js";
import { RESUME } from "../data/resume.js";
import { BLOG_POSTS } from "../data/blog.js";
import { answerQuestion } from "../knowledge.js";

const VISITOR_KEY = "alicia.visitorCount";
const VISITED_KEY = "alicia.counted";
const VISITOR_SEED = 1327;

/**
 * The fully static implementation of `PortfolioApi`. It serves bundled mock
 * data and answers chat locally, so the site is 100% functional with no server.
 * Async signatures mirror the remote API so callers can't tell the difference.
 */
export class LocalApi implements PortfolioApi {
  async getProjects(): Promise<Project[]> {
    return [...PROJECTS];
  }

  async getProject(slug: string): Promise<Project | undefined> {
    return PROJECTS.find((p) => p.slug === slug);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return [...BLOG_POSTS];
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return BLOG_POSTS.find((p) => p.slug === slug);
  }

  async getResume(): Promise<Resume> {
    return RESUME;
  }

  async getVisitorCount(): Promise<number> {
    return this.readCount();
  }

  async registerVisit(): Promise<number> {
    // Count each device once: a reload or return visit from the same browser
    // must not bump the number. (Offline fallback - the real global count lives
    // in the serverless Upstash counter; see remote-counter.ts.)
    try {
      if (localStorage.getItem(VISITED_KEY)) return this.readCount();
    } catch {
      /* storage unavailable - fall through and count this session */
    }
    const next = this.readCount() + 1;
    try {
      localStorage.setItem(VISITOR_KEY, String(next));
      localStorage.setItem(VISITED_KEY, "1");
    } catch {
      /* storage may be unavailable (private mode) - count stays ephemeral */
    }
    return next;
  }

  async *chat(messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string> {
    const reply = answerQuestion(messages);
    // Stream word-by-word to emulate a live model over a slow dial-up link.
    const tokens = reply.match(/\S+\s*/g) ?? [reply];
    for (const token of tokens) {
      if (signal?.aborted) return;
      await delay(28 + Math.random() * 42);
      yield token;
    }
  }

  private readCount(): number {
    try {
      const stored = localStorage.getItem(VISITOR_KEY);
      if (stored) return Number(stored) || VISITOR_SEED;
    } catch {
      /* ignore */
    }
    return VISITOR_SEED;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
