import type { PortfolioApi } from "./api/api.interface.js";
import type { ChatMessage } from "../types.js";
import { LocalApi } from "./api/local-api.js";
import { HttpApi } from "./api/http-api.js";
import { streamChatFrom } from "./api/remote-chat.js";
import { fetchVisitorCount, registerVisitRemote } from "./api/remote-counter.js";
import { getDeviceId } from "./device-id.js";
import { ChatLimitError, setOfflineAnswer, countOfflineQuestion } from "./chat-quota.js";
import { config } from "../config.js";

export type { PortfolioApi } from "./api/api.interface.js";

/**
 * Data-source facade. Every page/component imports `api` from here and never
 * touches a concrete implementation. The choice is made once, from config:
 *
 *   - VITE_API_BASE_URL set   -> HttpApi   (live REST backend)
 *   - otherwise               -> LocalApi  (bundled mock data)
 *
 * The AI assistant always talks to the real OpenAI endpoint (config.chatApiUrl),
 * whichever data source is used - see chatWithFallback() below. This single
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

impl = { ...bind(impl), chat: chatWithFallback };

export const api: PortfolioApi = impl;

const offline = new LocalApi();

/**
 * The real AI first. Only if it can't be reached at all (no server, missing
 * OpenAI key, OpenAI down...) and nothing has been said yet, answer with the
 * basic offline keyword replies instead - and flag it, so the chat widget tells
 * the visitor it's not the real AI. Hitting the question limit is not a
 * fallback case: that error goes straight to the widget.
 */
async function* chatWithFallback(messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string> {
  setOfflineAnswer(false);
  let started = false;
  try {
    for await (const chunk of streamChatFrom(config.chatApiUrl, messages, signal)) {
      started = true;
      yield chunk;
    }
  } catch (err) {
    if (started || err instanceof ChatLimitError || signal?.aborted) throw err;
    setOfflineAnswer(true);
    countOfflineQuestion(); // the 5th offline question starts the 4-hour wait; throws while it runs
    yield* offline.chat(messages, signal);
  }
}

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
