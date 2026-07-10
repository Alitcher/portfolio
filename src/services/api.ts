import type { PortfolioApi } from "./api/api.interface.js";
import type { ChatMessage } from "../types.js";
import { LocalApi } from "./api/local-api.js";
import { HttpApi } from "./api/http-api.js";
import { streamChatFrom } from "./api/remote-chat.js";
import { fetchVisitorCount, registerVisitRemote } from "./api/remote-counter.js";
import { getDeviceId } from "./device-id.js";
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
let impl: PortfolioApi = config.useRemoteApi ? new HttpApi(config.apiBaseUrl) : new LocalApi();

// The real global visitor count is an independent layer: it can front a
// same-origin serverless counter (Upstash) while the rest of the data stays
// local — exactly like the chat override below.
if (config.useRemoteCounter) {
  impl = {
    ...bind(impl),
    getVisitorCount: () => fetchVisitorCount(config.counterApiUrl),
    registerVisit: () => registerVisitRemote(config.counterApiUrl, getDeviceId()),
  };
}

if (config.useRemoteChat) {
  impl = {
    ...bind(impl),
    chat: (messages: ChatMessage[], signal?: AbortSignal) =>
      streamChatFrom(config.chatApiUrl, messages, signal),
  };
}

export const api: PortfolioApi = impl;

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
