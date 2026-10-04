import "./styles/theme.css";
import "./styles/typography.css";
import "./styles/windows.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";

import { el, clear } from "./components/dom.js";
import { navMenu } from "./components/menu.js";
import { systemInfoPanel, statusPanel } from "./components/sidebar.js";
import { visitorCounter, updateVisitorCounter } from "./components/counter.js";
import { statusBar, liveClock } from "./components/statusbar.js";
import { Router } from "./services/router.js";
import { api } from "./services/api.js";
import { config } from "./config.js";
import { HOME } from "./services/data/home.js";

import { homePage } from "./pages/home.js";
import { projectsPage, projectDetailPage } from "./pages/projects.js";
import { xrPage } from "./pages/xr.js";
import { backendPage } from "./pages/backend.js";
import { graphicsPage } from "./pages/graphics.js";
import { blogPage, blogPostPage } from "./pages/blog.js";
import { resumePage } from "./pages/resume.js";
import { contactPage } from "./pages/contact.js";

const app = document.getElementById("app")!;

// ---- Persistent chrome ------------------------------------------------------

const clock = liveClock();
const crtToggle = el("button", {
  class: "win-btn crt-toggle",
  title: "Toggle CRT scanline mode",
  attrs: { "aria-label": "Toggle CRT mode", type: "button" },
}, "CRT");
crtToggle.addEventListener("click", () => document.body.classList.toggle("crt-on"));

const topBar = el(
  "div",
  { class: "app-titlebar" },
  el("span", {}, "Welcome to Alicia's Homepage!"),
  el(
    "span",
    { class: "titlebar-right" },
    clock.node,
    crtToggle,
    el(
      "span",
      { class: "win-controls" },
      el("button", { class: "win-btn", html: "_", attrs: { "aria-label": "Minimize", type: "button" } }),
      el("button", { class: "win-btn", html: "&#9633;", attrs: { "aria-label": "Maximize", type: "button" } }),
      el("button", { class: "win-btn", html: "X", attrs: { "aria-label": "Close", type: "button" } }),
    ),
  ),
);

// Header roles link to their pages, matched by position in HOME.roles
// (Unity3D, Fullstack, Computer Graphics).
const ROLE_ROUTES: readonly string[] = ["#/xr", "#/backend", "#/graphics"];

// Start at 0 when a real count will load from the server, so we never flash the
// local seed; the offline fallback keeps the retro seed for a "lived-in" look.
const counterMount = visitorCounter(config.useRemoteApi || config.useRemoteCounter ? 0 : 1327);
const header = el(
  "header",
  { class: "site-header" },
  logoSvg(),
  el(
    "div",
    { class: "site-title" },
    el("h1", {}, config.siteOwner),
    el(
      "div",
      { class: "roles" },
      ...HOME.roles.flatMap((role, i) => {
        const isLast = i === HOME.roles.length - 1;
        const href = ROLE_ROUTES[i];
        const node = el(href ? "a" : "span", { class: isLast ? "accent" : "", href }, role);
        return isLast ? [node] : [node, " ", el("span", { class: "sep" }, "|"), " "];
      }),
    ),
  ),
  el(
    "div",
    { class: "visitor-box raised" },
    el("div", { class: "label" }, "You are visitor number:"),
    counterMount,
    el("span", { class: "visitors-icon", html: "&#128101;" }),
  ),
);

const navBar = el("div", { class: "nav-bar" });
const leftSidebar = el("aside", { class: "sidebar-left" });
const layout = el("div", { class: "layout" }, leftSidebar);
const footer = statusBar(__LAST_UPDATED__);
const crtOverlay = el("div", { class: "crt-overlay", attrs: { "aria-hidden": "true" } });

clear(app);
app.removeAttribute("aria-busy");
app.append(topBar, header, navBar, layout, footer, crtOverlay);

// ---- Routing ----------------------------------------------------------------

const router = new Router()
  .add("/", homePage)
  .add("/projects", projectsPage)
  .add("/projects/:slug", (ctx) => projectDetailPage(ctx.params.slug))
  .add("/xr", xrPage)
  .add("/backend", backendPage)
  .add("/graphics", graphicsPage)
  .add("/blog", blogPage)
  .add("/blog/:slug", (ctx) => blogPostPage(ctx.params.slug))
  .add("/resume", resumePage)
  .add("/contact", contactPage)
  .setNotFound(() => notFound());

router.start((node, ctx) => {
  // Refresh the nav highlight and left sidebar, then swap the page region.
  const route = "#" + ctx.path;
  clear(navBar);
  navBar.append(navMenu(route));
  clear(leftSidebar);
  leftSidebar.append(statusPanel(), systemInfoPanel());

  // Remove everything after the persistent left sidebar, then mount the page.
  while (layout.children.length > 1) layout.lastElementChild!.remove();
  layout.appendChild(node);
});

// ---- Retro flair: visitor counter -------------------------------------------

api
  .registerVisit()
  .then((count) => updateVisitorCounter(document.getElementById("visitorCounter")!, count))
  .catch(() => {
    /* offline / no storage - keep the seeded number */
  });

window.addEventListener("beforeunload", () => clock.stop());

// ---- Helpers ----------------------------------------------------------------

function notFound(): Node {
  const wrap = document.createDocumentFragment();
  const main = el(
    "main",
    {},
    el(
      "section",
      { class: "window" },
      el("div", { class: "titlebar" }, el("span", {}, ":: 404 - PAGE NOT FOUND ::")),
      el(
        "div",
        { class: "body" },
        el("p", {}, "The page you requested could not be found on this server."),
        el("a", { href: "#/", html: "&laquo; Return to Home" }),
      ),
    ),
  );
  wrap.appendChild(main);
  return wrap;
}

function logoSvg(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "logo");
  svg.setAttribute("viewBox", "0 0 90 90");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <g stroke="#000" stroke-width="2" fill="#B0B0B0">
      <rect x="14" y="18" width="26" height="26"/>
      <polygon points="14,18 24,8 50,8 40,18" fill="#D8D8D8"/>
      <polygon points="40,18 50,8 50,34 40,44" fill="#888"/>
    </g>
    <line x1="58" y1="6" x2="58" y2="74" stroke="#0A0" stroke-width="3"/>
    <line x1="6" y1="74" x2="84" y2="74" stroke="#00F" stroke-width="3"/>
    <line x1="58" y1="74" x2="80" y2="52" stroke="#F00" stroke-width="3"/>`;
  return svg;
}
