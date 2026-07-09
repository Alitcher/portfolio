import { el, escapeHtml } from "./dom.js";
import { button } from "./button.js";
import { api } from "../services/api.js";
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
    attrs: { "aria-label": "Ask AliciaAI", autocomplete: "off" },
  }) as HTMLInputElement;

  const sendBtn = button({ label: "Send", id: "sendBtn" });

  const send = async () => {
    const text = input.value.trim();
    if (!text || busy) return;
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
    } catch {
      dialup.remove();
      appendMessage(log, "ai", "Connection dropped. Please try again in a moment.");
    } finally {
      busy = false;
      setDisabled(false);
      input.focus();
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

  return el(
    "div",
    { class: "ai-body" },
    el(
      "div",
      { class: "ai-left" },
      el("div", { class: "robot", html: "&#129302;", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "ai-name" }, "AliciaAI"),
      el("div", { class: "ai-desc", html: "Your personal dev assistant<br>Ask me anything!" }),
      el("div", { class: "ai-online" }, "ONLINE"),
    ),
    el(
      "div",
      { class: "ai-right" },
      log,
      el("div", { class: "chat-input-row" }, input, sendBtn),
    ),
  );
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
