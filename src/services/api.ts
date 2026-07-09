import type { PortfolioApi } from "./api/api.interface.js";
import type { ChatMessage } from "../types.js";
import { LocalApi } from "./api/local-api.js";
import { HttpApi } from "./api/http-api.js";
import { streamChatFrom } from "./api/remote-chat.js";
import { config } from "../config.js";

export type { PortfolioApi } from "./api/api.interface.js";

/**
 * Data-source facade. Every page/component imports `api` from here and never
 * touches a concrete implementation. The choice is made once, from config:
 *
 *   - VITE_API_BASE_URL set   -> HttpApi   (live REST backend)
 *   - otherwise               -> LocalApi  (bundled mock data)
 *
 * Independently, VITE_CHAT_API_URL can point the AI assistant at the OpenAI
 * serverless endpoint while the rest of the data stays local. This single
 * indirection is what makes the frontend backend-ready.
 */
const base: PortfolioApi = config.useRemoteApi ? new HttpApi(config.apiBaseUrl) : new LocalApi();

export const api: PortfolioApi = config.useRemoteChat
  ? {
      ...bind(base),
      chat: (messages: ChatMessage[], signal?: AbortSignal) =>
        streamChatFrom(config.chatApiUrl, messages, signal),
    }
  : base;

/** Copy the base API's methods with `this` bound, so spreading keeps them working. */
function bind(impl: PortfolioApi): PortfolioApi {
  return {
    getProjects: impl.getProjects.bind(impl),
    getProject: impl.getProject.bind(impl),
    getBlogPosts: impl.getBlogPosts.bind(impl),
    getBlogPost: impl.getBlogPost.bind(impl),
    getResume: impl.getResume.bind(impl),
    getVisitorCount: impl.getVisitorCount.bind(impl),
    registerVisit: impl.registerVisit.bind(impl),
    chat: impl.chat.bind(impl),
  };
}
