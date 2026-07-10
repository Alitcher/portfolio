import { el } from "./dom.js";
import { initMusic, togglePlay, toggleMute, onMusicChange } from "./music-player.js";

type StatusTone = "coding" | "food" | "dinner" | "sleeping";

/**
 * Alicia's weekly routine, resolved to a live status.
 *   Weekdays (Mon-Fri): coding 09:00-21:00, except 11:00-12:00 (lunch) and
 *   18:00-19:00 (dinner); sleeping otherwise.
 *   Weekends (Sat-Sun): sleeping 00:00-14:00, coding otherwise.
 */
function currentStatus(now = new Date()): { tone: StatusTone; label: string } {
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;

  const status: Record<StatusTone, string> = {
    coding: "Coding...",
    food: "Enjoying food...",
    dinner: "Dinner time...",
    sleeping: "Sleeping... zzz",
  };

  let tone: StatusTone;
  if (isWeekend) {
    tone = hour < 14 ? "sleeping" : "coding";
  } else if (hour >= 9 && hour < 21) {
    if (hour === 11) tone = "food";
    else if (hour === 18) tone = "dinner";
    else tone = "coding";
  } else {
    tone = "sleeping";
  }

  return { tone, label: status[tone] };
}

/**
 * A standalone "STATUS" panel that follows the weekly schedule and refreshes
 * itself. Kept separate from SYSTEM INFO so the live status stands on its own.
 */
export function statusPanel(): HTMLElement {
  const dot = el("span", { class: "status-dot", attrs: { "aria-hidden": "true" } });
  const text = el("span", { class: "status-text" });
  const line = el("div", { class: "status-line" }, "Status: ", dot, " ", text);
  const panel = el("section", { class: "panel status-panel" }, el("h2", {}, ":: STATUS ::"), line);

  const render = () => {
    const { tone, label } = currentStatus();
    dot.dataset.tone = tone;
    text.textContent = label;
  };
  render();

  const id = window.setInterval(() => {
    // The sidebar is rebuilt on navigation; stop once this node is detached.
    if (!panel.isConnected) {
      window.clearInterval(id);
      return;
    }
    render();
  }, 30_000);

  return panel;
}

/**
 * The left "SYSTEM INFO" panel: OS, editor, languages, an animated coffee
 * meter, a blinking status light and a now-playing line. Values are static
 * flavour, as permitted by the spec.
 */
export function systemInfoPanel(): HTMLElement {
  return el(
    "section",
    { class: "panel sysinfo-panel" },
    el("h2", {}, ":: SYSTEM INFO ::"),
    el(
      "dl",
      { class: "sysinfo" },
      el("dt", {}, "OS:"), el("dd", {}, "Windows 11"),
      el("dt", {}, "Editor:"), el("dd", {}, "VS Code"),
      el("dt", {}, "Engine:"), el("dd", {}, "Unity 6.3 LTS"),
      el("dt", {}, "Language:"), el("dd", {}, "C#, C++, Python, TS, JS, Java, Latex, GLSL, HLSL"),
    ),
    el("div", {}, "Coffee Level:"),
    el(
      "div",
      { class: "coffee-row" },
      el("span", { html: "&#9749;" }),
      el("div", { class: "coffee-bar sunken" }, el("div", { class: "fill" })),
      el("span", {}, "75%"),
    ),
    el("div", { class: "now-playing-label" }, "Now Playing:"),
    (() => {
      const nowPlaying = el("div", { class: "now-playing" }, "Loading…");
      const playBtn = el(
        "button",
        {
          class: "music-btn",
          type: "button",
          title: "Play / pause",
          on: { click: () => togglePlay() },
        },
        "⏸",
      );
      const muteBtn = el(
        "button",
        {
          class: "music-btn",
          type: "button",
          title: "Mute / unmute",
          on: { click: () => toggleMute() },
        },
        "🔇",
      );
      onMusicChange(({ playing, muted, title }) => {
        nowPlaying.textContent = title;
        playBtn.textContent = playing ? "⏸" : "▶";
        muteBtn.textContent = muted ? "🔇" : "🔊";
      });
      // Kick off muted autoplay as soon as the sidebar mounts.
      initMusic();
      return el(
        "div",
        {},
        nowPlaying,
        el("div", { class: "music-controls" }, playBtn, muteBtn),
      );
    })(),
    el("div", { class: "current-project" }, "Current: OpenGL Renderer v2"),
    el("div", { class: "learning" }, "Learning: Vulkan"),
    el("div", { class: "last-updated-side" }, `Last Updated: ${__LAST_UPDATED__}`),
  );
}
