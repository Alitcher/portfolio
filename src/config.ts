/**
 * Central runtime configuration.
 *
 * The single most important architectural switch lives here: whether the app
 * reads from the built-in mock data or from a live REST backend. Everything
 * else is derived from `apiBaseUrl`.
 */

const rawBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const rawChat = (import.meta.env.VITE_CHAT_API_URL ?? "").trim();
const rawCounter = (import.meta.env.VITE_COUNTER_API_URL ?? "").trim();

export const config = {
  /** Backend origin, or "" for fully static / mock mode. */
  apiBaseUrl: rawBase.replace(/\/+$/, ""),
  /** Convenience flag: are we talking to a real backend? */
  get useRemoteApi(): boolean {
    return this.apiBaseUrl.length > 0;
  },
  /**
   * URL of the AI chat endpoint (the serverless function that talks to OpenAI).
   * Set VITE_CHAT_API_URL=/api/chat to enable the real AI assistant; leave
   * empty to fall back to the built-in offline mock replies.
   */
  chatApiUrl: rawChat.replace(/\/+$/, ""),
  get useRemoteChat(): boolean {
    return this.chatApiUrl.length > 0;
  },
  /**
   * URL of the real visitor-counter endpoint (the serverless function backed by
   * Upstash Redis). Set VITE_COUNTER_API_URL=/api/visitor-count to get a genuine
   * global count that counts each device once; leave empty to fall back to the
   * local per-device count.
   */
  counterApiUrl: rawCounter.replace(/\/+$/, ""),
  get useRemoteCounter(): boolean {
    return this.counterApiUrl.length > 0;
  },
  siteOwner: "Alicia Pankka",
  contact: {
    email: "alicia.pankka@gmail.com",
    github: "https://github.com/Alitcher/",
    linkedin: "https://www.linkedin.com/in/aliciagamedev/",
    location: "Helsinki,Finland",
  },
} as const;
