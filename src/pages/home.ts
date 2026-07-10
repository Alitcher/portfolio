import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { projectCard } from "../components/project-card.js";
import { aiChat } from "../components/ai-chat.js";
import { pageRegion, fragment, formatDate } from "./shared.js";
import { api } from "../services/api.js";
import { config } from "../config.js";
import { HOME } from "../services/data/home.js";
import type { HomeLink } from "../types.js";

/** The homepage: several stacked windows plus the home-only right sidebar. */
export async function homePage(): Promise<Node> {
  const [projects, posts] = await Promise.all([api.getProjects(), api.getBlogPosts()]);
  const featured = projects.filter((p) => p.featured);

  const welcome = windowEl(
    { title: ":: WELCOME ::", bodyClass: "welcome-body", controls: restoreClose() },
    el(
      "div",
      { class: "welcome-text" },
      el("h3", { html: HOME.welcome.greetingHtml }),
      ...HOME.welcome.intro.map((text) => el("p", {}, text)),
      el("p", { class: "focus-lead" }, HOME.welcome.focusLead),
      el("ul", {}, ...HOME.welcome.focus.map((item) => el("li", {}, item))),
    ),
    el(
      "div",
      { class: "welcome-side" },
      el("div", { class: "pc-art", html: "&#128421;&#65039;", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "powered-badge raised", html: HOME.welcome.poweredBadgeHtml }),
    ),
  );

  const projectsWindow = windowEl(
    { title: ":: FEATURED PROJECTS ::", controls: closeOnly() },
    el("div", { class: "projects-grid" }, ...featured.map((p) => projectCard(p, { variant: "compact" }))),
  );

  const assistant = windowEl(
    { title: ":: AI ASSISTANT ::", bodyClass: "ai-body-wrap", controls: closeOnly() },
    aiChat(),
  );

  const blogWindow = windowEl(
    { title: ":: LATEST BLOG POSTS ::", controls: restoreClose() },
    el(
      "ul",
      { class: "blog-list" },
      ...posts.slice(0, 4).map((post) =>
        el(
          "li",
          {},
          el("span", { class: "icon", html: "&#128196;" }),
          el(
            "span",
            {},
            el("a", { href: `#/blog/${post.slug}` }, post.title),
            el("br", {}),
            el("span", { class: "date" }, formatDate(post.date)),
          ),
        ),
      ),
    ),
    el("a", { class: "more-posts", href: "#/blog", html: "&raquo; More posts..." }),
  );

  const techWindow = windowEl(
    { title: ":: TECH STACK ::", controls: closeOnly() },
    el(
      "ul",
      { class: "stack-list" },
      ...HOME.techStack.map((s) => stackItem(s.chipClass, s.chip, s.label)),
    ),
  );

  const linksPanel = el(
    "section",
    { class: "panel" },
    el("h2", {}, ":: LINKS ::"),
    el("div", { class: "links-grid" }, ...HOME.links.map(linkBtn)),
  );

  const miscPanel = el(
    "section",
    { class: "panel" },
    el("h2", {}, ":: MISC ::"),
    el("p", { html: HOME.misc.bestViewedHtml }),
    el(
      "div",
      { class: "badges" },
      badge88("5", "Made with", "HTML!", ""),
      badge88("W3C", "CSS &#10003;", "", "badge-w3c"),
    ),
  );

  const main = fragment(welcome, projectsWindow, assistant);
  const aside = fragment(blogWindow, techWindow, linksPanel, miscPanel);
  return pageRegion(main, aside);
}

function stackItem(chipClass: string, chip: string, label: string): HTMLElement {
  return el("li", {}, el("span", { class: `chip ${chipClass}`, html: chip }), " " + label);
}

function linkBtn(link: HomeLink): HTMLElement {
  return el(
    "a",
    { class: "link-btn", href: resolveLinkHref(link) },
    el("span", { class: `lb-icon ${link.iconClass}`, html: link.icon }),
    " " + link.label,
  );
}

/** Resolve a link's destination: an explicit href, or a value from config.contact. */
function resolveLinkHref(link: HomeLink): string {
  if (link.href) return link.href;
  switch (link.contactKey) {
    case "github":
      return config.contact.github;
    case "linkedin":
      return config.contact.linkedin;
    case "email":
      return `mailto:${config.contact.email}`;
    default:
      return "#";
  }
}

function badge88(left: string, line1: string, line2: string, extra: string): HTMLElement {
  const right = el("div", { class: "b-right" }, el("span", { html: line1 }));
  if (line2) right.appendChild(el("span", { html: line2 }));
  return el(
    "div",
    { class: `badge88 ${extra}`.trim() },
    el("div", { class: "b-left", html: left }),
    right,
  );
}

function restoreClose() {
  return [
    { label: "Restore", symbol: "&#8599;" },
    { label: "Collapse", symbol: "-", collapse: true },
  ];
}
function closeOnly() {
  return [{ label: "Collapse", symbol: "-", collapse: true }];
}
