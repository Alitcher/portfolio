import { el } from "./dom.js";

/**
 * A mechanical-odometer visitor counter. Renders `value` zero-padded to
 * `digits` places inside individual digit cells.
 */
export function visitorCounter(value: number, digits = 6): HTMLElement {
  const text = Math.max(0, Math.floor(value)).toString().padStart(digits, "0").slice(-digits);
  return el(
    "span",
    { class: "odometer", id: "visitorCounter", attrs: { "aria-label": `Visitor number ${text}` } },
    ...text.split("").map((d) => el("span", {}, d)),
  );
}

/** Update an existing odometer element in place. */
export function updateVisitorCounter(node: HTMLElement, value: number, digits = 6): void {
  const fresh = visitorCounter(value, digits);
  node.replaceWith(fresh);
}
