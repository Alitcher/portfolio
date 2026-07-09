import { el } from "./dom.js";

export interface ButtonOptions {
  readonly label: string;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly className?: string;
  readonly id?: string;
}

/** A Windows-XP-style bevelled push button. */
export function button(options: ButtonOptions): HTMLButtonElement {
  return el("button", {
    class: `btn ${options.className ?? ""}`.trim(),
    id: options.id,
    type: options.type ?? "button",
    on: options.onClick ? { click: options.onClick } : undefined,
  }, options.label);
}
