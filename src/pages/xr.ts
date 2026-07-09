import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { projectCard } from "../components/project-card.js";
import { pageRegion } from "./shared.js";
import { api } from "../services/api.js";

/** Unity XR focus page. */
export async function xrPage(): Promise<Node> {
  const projects = (await api.getProjects()).filter((p) => p.category === "xr");

  const win = windowEl(
    { title: ":: UNITY XR DEVELOPMENT ::", controls: [] },
    el("p", { class: "page-intro" }, "Immersive experiences for VR, AR and mixed reality — built in Unity for Meta Quest and PCVR."),
    el(
      "div",
      { class: "focus-tags" },
      ...["VR", "AR", "Meta Quest", "OpenXR", "XR Interaction Toolkit"].map((t) =>
        el("span", { class: "tech-badge" }, t),
      ),
    ),
    el("h3", {}, "Projects"),
    el("div", { class: "projects-grid wide" }, ...projects.map((p) => projectCard(p, { variant: "full" }))),
  );

  return pageRegion(win);
}
