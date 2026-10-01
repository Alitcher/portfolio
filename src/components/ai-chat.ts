import { el, escapeHtml } from "./dom.js";
import { button } from "./button.js";
import { api } from "../services/api.js";
import {
  ChatLimitError,
  currentQuota,
  loadQuota,
  lastWindowResetAt,
  startOfflineWait,
  formatWait,
  formatCountdown,
  lastAnswerWasOffline,
} from "../services/chat-quota.js";
import { config } from "../config.js";
import type { ChatMessage } from "../types.js";

/**
 * The centerpiece: an old-desktop-app styled chat widget wired to the streaming
 * `api.chat()`. While waiting it shows a fake dial-up connection animation; the
 * reply then streams in token by token.
 */
export function aiChat(): HTMLElement {
  const history: ChatMessage[] = [];
  let busy = false;

  const log = el("div", {
    class: "chat-log sunken",
    id: "chatLog",
    attrs: { "aria-live": "polite" },
  });

  appendMessage(
    log,
    "ai",
    "Hello! I can help you learn more about my work, skills, or projects. What would you like to know?",
  );

  const input = el("input", {
    type: "text",
    id: "chatInput",
    placeholder: "Type your question here...",
    attrs: { "aria-label": "Ask AliciaAI", autocomplete: "off", maxlength: "500" },
  }) as HTMLInputElement;

  // Under the input, from the server's count (see api/chat.ts):
  //   AI online, questions left:  "4 of 5 questions left"
  //   out of questions:           light OFFLINE, "AI back online in 03:55:00"
  //                               (ticking; input locked until it's back)
  //   AI not reachable:           light OFFLINE, "AI back online in 03:12:40" - time left in the
  //                               last limit window, else a new 4-hour one started on page load
  //                               (saved, so reloads keep the same time; ONLINE again as soon as it's reachable)
  const quotaNote = el("div", { class: "chat-quota" });

  const sendBtn = button({ label: "Send", id: "sendBtn" });

  // The ONLINE/OFFLINE light. Starts as CONNECTING... until the check on load.
  const onlineEl = el("div", { class: "ai-online connecting" }, "CONNECTING...");

  const RECHECK_MS = 30_000;
  let connecting = true;
  let online = false; // the real AI's server answers
  let limited = false; // ...but this visitor's questions are used up
  let checking = false;
  let nextCheckAt = 0;

  const render = () => {
    const now = Date.now();
    const q = online ? currentQuota() : null;
    // Offline: keep counting down the last limit window, or start a 4-hour one
    // right away - visitors always see when the AI will be back.
    const lastResetAt = online || connecting ? null : lastWindowResetAt() ?? startOfflineWait();
    limited = online ? !!q && q.remaining <= 0 : !!lastResetAt; // offline: locked while the wait runs

    if (connecting) quotaNote.textContent = "";
    // (The page also re-checks every RECHECK_MS and flips to ONLINE as soon as
    // the real AI is reachable.)
    else if (!online) quotaNote.textContent = `AI back online in ${formatCountdown((lastResetAt ?? now) - now)}`;
    else if (limited) quotaNote.textContent = `AI back online in ${q?.resetAt ? formatCountdown(q.resetAt - now) : "a moment"}`;
    else if (q) quotaNote.textContent = `${q.remaining} of ${q.limit} questions left`;
    else quotaNote.textContent = "";
    quotaNote.classList.toggle("limited", !connecting && (!online || limited));

    onlineEl.textContent = connecting ? "CONNECTING..." : !online ? "OFFLINE" : limited ? "OFFLINE" : "ONLINE";
    onlineEl.classList.toggle("connecting", connecting);
    onlineEl.classList.toggle("offline", !connecting && (!online || limited));

    input.placeholder = limited ? "AI is offline until the countdown below ends" : "Type your question here...";
    if (!busy) setDisabled(limited);
  };

  const setOnline = (isOnline: boolean) => {
    connecting = false;
    online = isOnline;
    if (!online) nextCheckAt = Date.now() + RECHECK_MS;
    render();
  };

  // While the AI isn't reachable, look again every RECHECK_MS (see the tick below).
  const recheck = () => {
    checking = true;
    render();
    loadQuota().then((reachable) => {
      checking = false;
      setOnline(reachable);
    });
  };

  const send = async () => {
    const text = input.value.trim();
    if (!text || busy || limited) return;
    input.value = "";
    busy = true;
    setDisabled(true);

    appendMessage(log, "user", text);
    history.push({ role: "user", content: text });

    const dialup = appendDialup(log);
    const controller = new AbortController();

    try {
      const stream = api.chat(history, controller.signal);
      let first = true;
      let assistantEl: HTMLElement | null = null;
      let full = "";

      for await (const chunk of stream) {
        if (first) {
          dialup.remove();
          assistantEl = appendMessage(log, "ai", "");
          first = false;
        }
        full += chunk;
        setMessageText(assistantEl!, full);
        log.scrollTop = log.scrollHeight;
      }

      if (first) {
        // Stream produced nothing; remove the loader gracefully.
        dialup.remove();
        assistantEl = appendMessage(log, "ai", "Sorry, I didn't catch that. Try asking again!");
        full = assistantEl.textContent ?? "";
      }
      history.push({ role: "assistant", content: full });
      const offline = lastAnswerWasOffline();
      setOnline(!offline);
      if (offline && assistantEl) {
        // Never let a canned keyword answer pass for the real AI.
        assistantEl.appendChild(
          el("div", { class: "msg-offline" },
            "⚠ The AI is offline right now, so this is a basic automatic answer and may miss the point. " +
              `For a proper answer, email ${config.contact.email}.`),
        );
        log.scrollTop = log.scrollHeight;
      }
    } catch (err) {
      dialup.remove();
      // The unanswered question shouldn't stay in the history sent next time.
      history.pop();
      if (err instanceof ChatLimitError) {
        setOnline(!lastAnswerWasOffline()); // limit reached - on the server, or in offline mode
        appendMessage(
          log,
          "ai",
          `You've asked your ${err.limit} questions for now - you can ask again in ${formatWait(err.retryAfter)}. ` +
            `Want to talk sooner? Email me at ${config.contact.email}.`,
        );
      } else {
        appendMessage(log, "ai", "Connection dropped. Please try again in a moment.");
      }
    } finally {
      busy = false;
      render(); // new count; keeps the input locked if that was the last question
      if (!limited) input.focus();
    }
  };

  const setDisabled = (state: boolean) => {
    input.disabled = state;
    (sendBtn as HTMLButtonElement).disabled = state;
  };

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") send();
  });

  const root = el(
    "div",
    { class: "ai-body" },
    el(
      "div",
      { class: "ai-left" },
      el("div", { class: "robot", html: "&#129302;", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "ai-name" }, "AliciaAI"),
      el("div", { class: "ai-desc", html: "Your personal dev assistant<br>Ask me anything!" }),
      onlineEl,
    ),
    el(
      "div",
      { class: "ai-right" },
      log,
      el("div", { class: "chat-input-row" }, input, sendBtn),
      quotaNote,
    ),
  );

  // Check the AI straight away (light + counter before any question), then tick
  // every second: the countdowns, the end of the limit, and re-checking while
  // offline. The home page is rebuilt on navigation, so stop once this widget is gone.
  render();
  recheck();
  let shown = false;
  const timer = window.setInterval(() => {
    if (root.isConnected) shown = true;
    else if (shown) return window.clearInterval(timer); // was on the page, now removed
    if (!connecting && !online && !checking && !busy && Date.now() >= nextCheckAt) recheck();
    render();
  }, 1000);

  return root;
}

function appendMessage(log: HTMLElement, who: "ai" | "user", text: string): HTMLElement {
  const label = who === "ai" ? "AliciaAI:" : "You:";
  const div = el(
    "div",
    { class: "msg" },
    el("span", { class: who === "ai" ? "who-ai" : "who-user" }, label),
    " ",
    el("span", { class: "msg-text", html: escapeHtml(text) }),
  );
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

function setMessageText(msg: HTMLElement, text: string): void {
  const span = msg.querySelector<HTMLElement>(".msg-text");
  if (span) span.innerHTML = escapeHtml(text);
}

/** A fake dial-up connection loader that animates until removed. */
function appendDialup(log: HTMLElement): HTMLElement & { remove: () => void } {
  const frames = ["█", "██", "███", "████"];
  let frame = 0;
  const span = el("span", { class: "dialup" });
  const div = el("div", { class: "msg" }, span);
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;

  const paint = () => {
    span.textContent = `Connecting to AliciaAI... ${frames[frame]}`;
    frame = (frame + 1) % frames.length;
  };
  paint();
  const timer = window.setInterval(paint, 220);

  const original = div.remove.bind(div);
  (div as HTMLElement & { remove: () => void }).remove = () => {
    window.clearInterval(timer);
    original();
  };
  return div as HTMLElement & { remove: () => void };
}
