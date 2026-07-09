import { el } from "./dom.js";

export interface DesktopIconOptions {
  readonly icon: string;
  readonly label: string;
  readonly href: string;
}

/** A labelled icon link used in navigation and link grids. */
export function desktopIcon(options: DesktopIconOptions): HTMLElement {
  return el(
    "li",
    {},
    el("span", { class: "icon", html: options.icon }),
    el("a", { href: options.href }, options.label),
  );
}
