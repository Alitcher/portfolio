import { el } from "./dom.js";

export interface BrowserWindowOptions {
  /** Text shown in the title bar (before " — Netscape"). Defaults to the host. */
  readonly title?: string;
  /** Node to show if the screenshot image fails to load. */
  readonly fallback?: Node;
}

/**
 * A retro Win98/Netscape-style browser window framing a screenshot.
 *
 * `url` is shown in the address bar; `imageSrc` is a committed screenshot of
 * that site (captured with the map/JS fully rendered, so it always looks right
 * and loads instantly — no live screenshot service, no rate limits). If the
 * image fails to load, the viewport swaps to `fallback` so the frame is never
 * empty.
 */
export function browserWindow(
  url: string,
  imageSrc: string,
  options: BrowserWindowOptions = {},
): HTMLElement {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const title = options.title ?? host;

  const img = el("img", {
    class: "bw-shot",
    src: imageSrc,
    alt: `Screenshot of ${title}`,
    loading: "lazy",
  });

  const viewport = el("div", { class: "bw-viewport" }, img);

  img.addEventListener("error", () => {
    viewport.replaceChildren(
      options.fallback ?? el("div", { class: "bw-fallback" }, "Screenshot unavailable"),
    );
  });

  return el(
    "div",
    { class: "browser-window" },
    el(
      "div",
      { class: "bw-titlebar" },
      el("span", { class: "bw-title" }, `${title} — Netscape`),
      el(
        "span",
        { class: "bw-controls" },
        el("span", { class: "bw-btn" }, "-"),
        // el("span", { class: "bw-btn" }, "□"),
        // el("span", { class: "bw-btn" }, "✕"),
      ),
    ),
    el(
      "div",
      { class: "bw-addressbar" },
      el("span", { class: "bw-addr-label" }, "URL"),
      el("span", { class: "bw-addr-url" }, url),
    ),
    viewport,
  );
}
