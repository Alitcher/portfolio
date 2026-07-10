import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { projectCard } from "../components/project-card.js";
import { aiChat } from "../components/ai-chat.js";
import { pageRegion, fragment, formatDate } from "./shared.js";
import { api } from "../services/api.js";
import { config } from "../config.js";

/** The homepage: several stacked windows plus the home-only right sidebar. */
export async function homePage(): Promise<Node> {
  const [projects, posts] = await Promise.all([api.getProjects(), api.getBlogPosts()]);
  const featured = projects.filter((p) => p.featured);

  const welcome = windowEl(
    { title: ":: WELCOME ::", bodyClass: "welcome-body", controls: restoreClose() },
    el(
      "div",
      { class: "welcome-text" },
      el("h3", { html: "Hello! &#128075;" }),
      el("p", {}, "I'm Alicia, a developer who loves building interactive experiences, tools and systems."),
      el("p", {}, "I work with Unity for XR, build backend services, and explore the world of computer graphics — with a soft spot for C++ and distributed systems."),
      el("p", { class: "focus-lead" }, "Currently focusing on:"),
      el(
        "ul",
        {},
        el("li", {}, "Unity XR development (VR / AR / MR)"),
        el("li", {}, "Backend systems & distributed architecture"),
        el("li", {}, "Real-time rendering & graphics programming"),
      ),
    ),
    el(
      "div",
      { class: "welcome-side" },
      el("div", { class: "pc-art", html: "&#128421;&#65039;", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "powered-badge raised", html: "Powered by<br>&#9749; &amp; Curiosity" }),
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
      stackItem("chip-unity", "U", "Unity, C#"),
      stackItem("chip-cpp", "C+", "C++"),
      stackItem("chip-gl", "GL", "OpenGL / Vulkan"),
      stackItem("chip-ts", "TS", "TypeScript, Node.js"),
      stackItem("chip-db", "DB", "PostgreSQL, RabbitMQ"),
      stackItem("chip-docker", "&#128051;", "Docker, Linux"),
    ),
  );

  const linksPanel = el(
    "section",
    { class: "panel" },
    el("h2", {}, ":: LINKS ::"),
    el(
      "div",
      { class: "links-grid" },
      linkBtn("lb-gh", "GH", "GitHub", config.contact.github),
      linkBtn("lb-in", "in", "LinkedIn", config.contact.linkedin),
      linkBtn("lb-pdf", "R", "Resume (PDF)", "#/resume"),
      linkBtn("lb-mail", "&#9993;", "Email Me", `mailto:${config.contact.email}`),
    ),
  );

  const miscPanel = el(
    "section",
    { class: "panel" },
    el("h2", {}, ":: MISC ::"),
    el("p", { html: "Best viewed in:<br>1024 x 768 or higher" }),
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

function linkBtn(iconClass: string, icon: string, label: string, href: string): HTMLElement {
  return el(
    "a",
    { class: "link-btn", href },
    el("span", { class: `lb-icon ${iconClass}`, html: icon }),
    " " + label,
  );
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
