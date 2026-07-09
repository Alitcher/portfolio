import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { projectCard } from "../components/project-card.js";
import { pageRegion } from "./shared.js";
import { api } from "../services/api.js";

/** Backend development focus page. */
export async function backendPage(): Promise<Node> {
  const projects = (await api.getProjects()).filter((p) => p.category === "backend");

  const win = windowEl(
    { title: ":: BACKEND DEVELOPMENT ::", controls: [] },
    el("p", { class: "page-intro" }, "Event-driven, containerised services designed to stay resilient under load."),
    el(
      "div",
      { class: "focus-tags" },
      ...["ASP.NET Core", "RabbitMQ", "PostgreSQL", "Docker", "gRPC", "Distributed Systems"].map((t) =>
        el("span", { class: "tech-badge" }, t),
      ),
    ),
    el("h3", {}, "Projects"),
    el("div", { class: "projects-grid wide" }, ...projects.map((p) => projectCard(p, { variant: "full" }))),
    projects.length === 0
      ? el("p", { class: "muted" }, "More backend write-ups coming soon.")
      : el("span", {}),
  );

  return pageRegion(win);
}
