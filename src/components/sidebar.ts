import { el } from "./dom.js";
import { initMusic, togglePlay, toggleMute, onMusicChange } from "./music-player.js";

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
    el(
      "div",
      { class: "status-line" },
      "Status: ",
      el("span", { class: "status-dot", attrs: { "aria-hidden": "true" } }),
      " Coding...",
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
    el("div", { class: "last-updated-side" }, "Last Updated: June 30, 2026"),
  );
}
