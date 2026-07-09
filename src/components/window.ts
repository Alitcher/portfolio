import { el } from "./dom.js";

export interface WindowControl {
  readonly label: string;
  readonly symbol: string;
  readonly onClick?: () => void;
}

export interface WindowOptions {
  readonly title: string;
  /** Extra class on the outer `.window` element. */
  readonly className?: string;
  /** Title-bar buttons (defaults to a decorative minimize + close pair). */
  readonly controls?: readonly WindowControl[];
  /** Extra class on the `.body` element. */
  readonly bodyClass?: string;
}

const DEFAULT_CONTROLS: readonly WindowControl[] = [
  { label: "Minimize", symbol: "_" },
  { label: "Close", symbol: "X" },
];

/**
 * The core retro chrome: a gray panel with a title bar and bevelled border.
 * Returns both the outer element and the body so callers can fill it.
 */
export function createWindow(
  options: WindowOptions,
  ...content: (Node | string)[]
): { root: HTMLElement; body: HTMLElement } {
  const controls = options.controls ?? DEFAULT_CONTROLS;

  const body = el("div", { class: `body ${options.bodyClass ?? ""}`.trim() }, ...content);

  const root = el(
    "section",
    { class: `window ${options.className ?? ""}`.trim() },
    el(
      "div",
      { class: "titlebar" },
      el("span", {}, options.title),
      el(
        "span",
        { class: "controls" },
        ...controls.map((c) =>
          el("button", {
            class: "win-btn",
            html: c.symbol,
            attrs: { "aria-label": c.label, type: "button" },
            on: c.onClick ? { click: c.onClick } : undefined,
          }),
        ),
      ),
    ),
    body,
  );

  return { root, body };
}

/** Convenience wrapper that returns just the root element. */
export function windowEl(options: WindowOptions, ...content: (Node | string)[]): HTMLElement {
  return createWindow(options, ...content).root;
}
