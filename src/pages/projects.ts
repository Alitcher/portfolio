import { el, clear } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { projectCard } from "../components/project-card.js";
import { browserWindow } from "../components/browser-window.js";
import { pageRegion, backLink } from "./shared.js";
import { api } from "../services/api.js";
import type { Project, ProjectCategory } from "../types.js";

const FILTERS: { label: string; value: ProjectCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Unity XR", value: "xr" },
  { label: "Backend", value: "backend" },
  { label: "Graphics", value: "graphics" },
  { label: "GIS", value: "gis" },
];

/** Projects index with client-side category filtering. */
export async function projectsPage(): Promise<Node> {
  const projects = await api.getProjects();

  const grid = el("div", { class: "projects-grid wide" });
  const renderGrid = (category: ProjectCategory | "all") => {
    clear(grid);
    const shown = category === "all" ? projects : projects.filter((p) => p.category === category);
    if (shown.length === 0) {
      grid.appendChild(el("p", {}, "No projects in this category yet."));
      return;
    }
    for (const p of shown) grid.appendChild(projectCard(p, { variant: "full" }));
  };

  const filterBar = el(
    "div",
    { class: "filter-bar", role: "group", attrs: { "aria-label": "Filter projects" } },
    ...FILTERS.map((f, i) => {
      const btn = el(
        "button",
        { class: "btn filter-btn" + (i === 0 ? " active" : ""), type: "button" },
        f.label,
      );
      btn.addEventListener("click", () => {
        filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(f.value);
      });
      return btn;
    }),
  );

  renderGrid("all");

  const win = windowEl(
    { title: ":: PROJECTS ::", controls: [] },
    el("p", { class: "page-intro" }, "A selection of things I've built across XR, backend and graphics. Filter by area:"),
    filterBar,
    grid,
  );

  return pageRegion(win);
}

/** Detailed view of a single project. */
export async function projectDetailPage(slug: string): Promise<Node> {
  const project = await api.getProject(slug);
  if (!project) {
    return pageRegion(
      windowEl(
        { title: ":: PROJECT NOT FOUND ::", controls: [] },
        el("p", {}, "That project doesn't exist."),
        backLink("#/projects", "Back to Projects"),
      ),
    );
  }

  // Projects with a live site get a real screenshot inside a retro browser
  // window as the hero; the rest keep the pixel-art placeholder tile plus a
  // separate Screenshots section.
  const pixelHero = el("div", { class: `detail-hero thumb-${project.thumbTheme}`, html: project.thumbLabel });
  const parts: Node[] = [
    backLink("#/projects", "Back to Projects"),
    project.screenshot
      ? browserWindow(project.links.demo ?? "", project.screenshot, {
          title: project.title,
          fallback: pixelHero,
        })
      : pixelHero,
    section("Overview", el("p", {}, project.overview)),
  ];

  if (!project.screenshot) {
    parts.push(
      section("Screenshots", el("div", { class: "screenshot-row" },
        screenshotPlaceholder(project), screenshotPlaceholder(project))),
    );
  }

  parts.push(
    section("Technologies", techBadges(project.tech)),
    section("Lessons Learned", el("ul", { class: "lessons" },
      ...project.lessons.map((l) => el("li", {}, l)))),
    linksRow(project),
  );

  const win = windowEl({ title: `:: ${project.title.toUpperCase()} ::`, controls: [] }, ...parts);

  return pageRegion(win);
}

function section(title: string, ...content: Node[]): HTMLElement {
  return el("div", { class: "detail-section" }, el("h3", {}, title), ...content);
}

function techBadges(tech: readonly string[]): HTMLElement {
  return el("div", { class: "tech-badges" }, ...tech.map((t) => el("span", { class: "tech-badge" }, t)));
}

function screenshotPlaceholder(project: Project): HTMLElement {
  return el("div", { class: `screenshot thumb-${project.thumbTheme} sunken`, html: "&#128247;" });
}

function linksRow(project: Project): HTMLElement {
  const row = el("div", { class: "detail-links" });
  if (project.links.github)
    row.appendChild(el("a", { class: "link-btn", href: project.links.github },
      el("span", { class: "lb-icon lb-gh", html: "GH" }), " GitHub"));
  if (project.links.demo)
    row.appendChild(el("a", { class: "link-btn", href: project.links.demo },
      el("span", { class: "lb-icon lb-in", html: "&#9658;" }), " Live Demo"));
  if (!project.links.github && !project.links.demo)
    row.appendChild(el("p", { class: "muted" }, "Source and demo links coming soon."));
  return row;
}
