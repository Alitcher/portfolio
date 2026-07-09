import { el } from "../components/dom.js";

/**
 * Assemble a page's grid region: a `<main>` column plus an optional right
 * `<aside>`. Returned as a DocumentFragment so the shell can drop it straight
 * into the persistent `.layout` grid (after the left sidebar).
 */
export function pageRegion(main: Node, aside?: Node): DocumentFragment {
  const frag = document.createDocumentFragment();
  const mainEl = el("main", {});
  mainEl.appendChild(main);
  frag.appendChild(mainEl);
  if (aside) {
    const asideEl = el("aside", { class: "sidebar-right" });
    asideEl.appendChild(aside);
    frag.appendChild(asideEl);
  }
  return frag;
}

/** A group of nodes wrapped in a fragment (avoids intermediate divs). */
export function fragment(...nodes: (Node | string)[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const n of nodes) frag.appendChild(typeof n === "string" ? document.createTextNode(n) : n);
  return frag;
}

/** A small "breadcrumb"/back link used on detail pages. */
export function backLink(href: string, label: string): HTMLElement {
  return el("a", { class: "back-link", href, html: `&laquo; ${label}` });
}

/** Format an ISO date (YYYY-MM-DD) as "June 24, 2026". */
export function formatDate(iso: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${months[m - 1]} ${d}, ${y}`;
}
