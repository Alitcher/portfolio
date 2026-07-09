/**
 * Tiny, dependency-free DOM helpers.
 *
 * Deliberately minimal: enough to build UI declaratively without a framework,
 * while keeping every component a plain function that returns an HTMLElement.
 */

type Child = Node | string | null | undefined | false;

export interface ElAttrs {
  class?: string;
  id?: string;
  href?: string;
  src?: string;
  alt?: string;
  type?: string;
  title?: string;
  placeholder?: string;
  value?: string;
  role?: string;
  tabindex?: string;
  loading?: "lazy" | "eager";
  html?: string;
  dataset?: Record<string, string>;
  attrs?: Record<string, string>;
  on?: Partial<Record<keyof HTMLElementEventMap, (ev: Event) => void>>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: ElAttrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (attrs.class) node.className = attrs.class;
  if (attrs.id) node.id = attrs.id;
  if (attrs.role) node.setAttribute("role", attrs.role);
  if (attrs.tabindex) node.setAttribute("tabindex", attrs.tabindex);
  if (attrs.title) node.title = attrs.title;
  if (attrs.href && "href" in node) (node as HTMLAnchorElement).href = attrs.href;
  if (attrs.src && "src" in node) (node as HTMLImageElement).src = attrs.src;
  if (attrs.alt && "alt" in node) (node as HTMLImageElement).alt = attrs.alt;
  if (attrs.type && "type" in node) (node as HTMLInputElement).type = attrs.type;
  if (attrs.placeholder && "placeholder" in node)
    (node as HTMLInputElement).placeholder = attrs.placeholder;
  if (attrs.value && "value" in node) (node as HTMLInputElement).value = attrs.value;
  if (attrs.loading && "loading" in node) (node as HTMLImageElement).loading = attrs.loading;
  if (attrs.html !== undefined) node.innerHTML = attrs.html;

  if (attrs.dataset) {
    for (const [k, v] of Object.entries(attrs.dataset)) node.dataset[k] = v;
  }
  if (attrs.attrs) {
    for (const [k, v] of Object.entries(attrs.attrs)) node.setAttribute(k, v);
  }
  if (attrs.on) {
    for (const [event, handler] of Object.entries(attrs.on)) {
      if (handler) node.addEventListener(event, handler as EventListener);
    }
  }

  append(node, children);
  return node;
}

export function append(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Escape a string for safe insertion into an HTML context. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
