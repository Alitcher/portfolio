import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { pageRegion } from "./shared.js";
import { api } from "../services/api.js";
import { config } from "../config.js";
import type { ResumeEntry, ResumeProject } from "../types.js";

/** Resume page: education, experience, skills, languages + PDF download. */
export async function resumePage(): Promise<Node> {
  const resume = await api.getResume();

  const downloadBtn = el(
    "a",
    { class: "btn download-btn", href: resume.pdfUrl, attrs: { download: `${config.siteOwner.replace(/\s+/g, "-")}-Resume.pdf` } },
    "⬇ Download PDF",
  );

  const win = windowEl(
    { title: ":: RESUME ::", controls: [] },
    el("div", { class: "resume-head" },
      el("div", {}, el("h3", {}, config.siteOwner),
        el("p", { class: "muted" }, "Unity XR Developer · Backend Developer · Computer Graphics")),
      downloadBtn,
    ),

    resumeSection("Education", resume.education.map(entryEl)),
    resumeSection("Work Experience", resume.experience.map(entryEl)),
    resumeSection("Professional Projects", resume.projects.map(projectEntryEl)),
    resumeSection("Skills", [
      el("div", { class: "skill-groups" },
        ...resume.skills.map((g) =>
          el("div", { class: "skill-group" },
            el("h4", {}, g.name),
            el("div", { class: "tech-badges" }, ...g.items.map((i) => el("span", { class: "tech-badge" }, i))),
          ),
        ),
      ),
    ]),
    resumeSection("Languages", [
      el("ul", { class: "lang-list" },
        ...resume.languages.map((l) =>
          el("li", {}, el("strong", {}, l.name), `: ${l.level}`)),
      ),
    ]),
  );

  return pageRegion(win);
}

function resumeSection(title: string, content: Node[]): HTMLElement {
  return el("div", { class: "resume-section" }, el("h3", {}, title), ...content);
}

function entryEl(entry: ResumeEntry): HTMLElement {
  return el(
    "div",
    { class: "resume-entry" },
    el("div", { class: "resume-entry-head" },
      el("strong", {}, entry.title),
      el("span", { class: "resume-period" }, entry.period)),
    el("div", { class: "resume-org" }, entry.org),
    el("ul", {}, ...entry.points.map((p) => el("li", {}, p))),
  );
}

function projectEntryEl(project: ResumeProject): HTMLElement {
  return el(
    "div",
    { class: "resume-entry" },

    el("strong", {}, project.title),

    project.technologies.length > 0
      ? el(
          "div",
          { class: "tech-badges" },
          ...project.technologies.map((t) => el("span", { class: "tech-badge" }, t)),
        )
      : el("div"),



    el("ul", {}, ...project.points.map((p) => el("li", {}, p))),
        project.links.length > 0
      ? el(
          "div",
          { class: "project-links" },
          ...project.links.flatMap((link, index) => [
            ...(index > 0 ? [document.createTextNode(" | ")] : []),
            el(
              "a",
              {
                href: link.url,
                class: "project-link",
                attrs: {
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
              link.name,
            ),
          ]),
        )
      : el("div"),
  );
}