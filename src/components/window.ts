import { el } from "./dom.js";

export interface WindowControl {
  readonly label: string;
  readonly symbol: string;
  readonly onClick?: () => void;
  /**
   * When true, this button collapses the window body on click and expands it
   * again on the next click (a classic minimize/restore toggle).
   */
  readonly collapse?: boolean;
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
  { label: "Collapse", symbol: "-", collapse: true },
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

  const root = el("section", { class: `window ${options.className ?? ""}`.trim() });

  const toggleCollapse = (btn: HTMLElement) => {
    const collapsed = root.classList.toggle("collapsed");
    btn.setAttribute("aria-expanded", String(!collapsed));
  };

  const buttons = controls.map((c) => {
    const btn = el("button", {
      class: "win-btn",
      html: c.symbol,
      attrs: { "aria-label": c.label, type: "button" },
    });
    if (c.onClick) btn.addEventListener("click", c.onClick);
    else if (c.collapse) {
      btn.setAttribute("aria-expanded", "true");
      btn.addEventListener("click", () => toggleCollapse(btn));
    }
    return btn;
  });

  root.append(
    el(
      "div",
      { class: "titlebar" },
      el("span", {}, options.title),
      el("span", { class: "controls" }, ...buttons),
    ),
    body,
  );

  return { root, body };
}

/** Convenience wrapper that returns just the root element. */
export function windowEl(options: WindowOptions, ...content: (Node | string)[]): HTMLElement {
  return createWindow(options, ...content).root;
}
