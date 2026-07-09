import { el } from "./dom.js";
import type { Project } from "../types.js";

export interface ProjectCardOptions {
  /** Compact card for the homepage grid vs. full card for list pages. */
  readonly variant?: "compact" | "full";
}

/** A single project thumbnail card. */
export function projectCard(project: Project, options: ProjectCardOptions = {}): HTMLElement {
  const variant = options.variant ?? "compact";
  const detailRoute = `#/projects/${project.slug}`;

  const thumb = el(
    "div",
    { class: `thumb thumb-${project.thumbTheme} sunken`, html: project.thumbLabel },
  );

  const children: (Node | string)[] = [
    thumb,
    el("h4", {}, el("a", { href: detailRoute }, project.title)),
    el("p", {}, variant === "full" ? project.overview : project.summary),
  ];

  if (variant === "full") {
    children.push(
      el("p", { class: "card-tech" }, el("strong", {}, "Tech: "), project.tech.join(", ")),
    );
  }

  children.push(el("a", { class: "details", href: detailRoute, html: "Details &raquo;" }));

  return el("div", { class: "project-card" }, ...children);
}
