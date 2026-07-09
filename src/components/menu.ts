import { el } from "./dom.js";
import { desktopIcon } from "./desktop-icon.js";

export interface MenuItem {
  readonly icon: string;
  readonly label: string;
  /** Hash route, e.g. "#/projects". */
  readonly route: string;
}

/** The primary site navigation, rendered as a retro icon list. */
export const NAV_ITEMS: readonly MenuItem[] = [
  { icon: "&#127968;", label: "Home", route: "#/" },
  { icon: "&#128193;", label: "Projects", route: "#/projects" },
  { icon: "&#129405;", label: "Unity XR", route: "#/xr" },
  { icon: "&#128421;", label: "Backend", route: "#/backend" },
  { icon: "&#127912;", label: "Computer Graphics", route: "#/graphics" },
  { icon: "&#128221;", label: "Blog / Notes", route: "#/blog" },
  { icon: "&#128196;", label: "Resume", route: "#/resume" },
  { icon: "&#9993;", label: "Contact Me", route: "#/contact" },
];

/**
 * Build the navigation panel. `activeRoute` highlights the current page.
 */
export function navMenu(activeRoute: string): HTMLElement {
  const list = el(
    "ul",
    { class: "nav-list" },
    ...NAV_ITEMS.map((item) => {
      const li = desktopIcon({ icon: item.icon, label: item.label, href: item.route });
      if (routeMatches(activeRoute, item.route)) li.classList.add("active");
      return li;
    }),
  );

  return el(
    "nav",
    { class: "panel nav-panel", attrs: { "aria-label": "Main navigation" } },
    el("h2", {}, ":: NAVIGATION ::"),
    list,
  );
}

function routeMatches(active: string, route: string): boolean {
  const norm = (r: string) => r.replace(/^#/, "").replace(/\/$/, "") || "/";
  const a = norm(active);
  const b = norm(route);
  if (b === "/") return a === "/";
  return a === b || a.startsWith(b + "/");
}
