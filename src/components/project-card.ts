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

  const thumb = project.screenshot ? screenshotThumb(project) : placeholderThumb(project);

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

/** The retro pixel-tile thumbnail (default when there's no live site). */
function placeholderThumb(project: Project): HTMLElement {
  return el("div", { class: `thumb thumb-${project.thumbTheme} sunken`, html: project.thumbLabel });
}

/**
 * A committed screenshot of the project's live site as the card thumbnail.
 * Falls back to the pixel tile if the image can't load.
 */
function screenshotThumb(project: Project): HTMLElement {
  const img = el("img", {
    class: "thumb thumb-shot sunken",
    src: project.screenshot as string,
    alt: `${project.title} live site`,
    loading: "lazy",
  });
  img.addEventListener("error", () => img.replaceWith(placeholderThumb(project)));
  return img;
}
