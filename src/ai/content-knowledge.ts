/**
 * Turns the site's own content files into plain-text facts for AliciaAI's
 * system prompt (see persona.ts). Whatever you change in src/content/ - by hand
 * or in the editor - is what the assistant knows after the next deploy, so the
 * chat can't drift out of date with the site.
 *
 * Only JSON is read here: api/chat.ts runs as a Vercel function, where the
 * Vite-only `import.meta.glob` used for the Markdown files isn't available.
 * For the same reason this must not import src/config.ts (it reads
 * `import.meta.env`, which only exists in the Vite build).
 */
import home from "../content/home.json";
import sidebar from "../content/sidebar.json";
import resume from "../content/resume.json";
import projects from "../content/projects.json";
import type { HomeContent, Project, Resume, SidebarContent } from "../types.js";

const HOME = home as HomeContent;
const SIDEBAR = sidebar as SidebarContent;
const RESUME = resume as Resume;
const PROJECTS = projects as readonly Project[];

const CATEGORY_NAMES: Record<string, string> = {
  xr: "Unity XR",
  backend: "Backend",
  graphics: "Computer Graphics",
  gis: "GIS",
};

/** Several fields hold HTML (e.g. "Heya! &#128075;", "<br>"): reduce them to plain text. */
function plain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Leave out placeholder links ("https://youtube.com/...", example.com, a bare github.com). */
function realUrl(url: string | undefined): url is string {
  if (!url) return false;
  return !/\.\.\.|example\.com|^https?:\/\/(www\.)?github\.com\/?$/i.test(url.trim());
}

const bullets = (items: readonly string[], indent = "  ") => items.map((i) => `${indent}- ${plain(i)}`).join("\n");

export function contentKnowledge(): string {
  const out: string[] = [];

  out.push(
    "## About (from the homepage)",
    `Roles: ${HOME.roles.map(plain).join(", ")}`,
    ...HOME.welcome.intro.map(plain),
    `${plain(HOME.welcome.focusLead)}`,
    bullets(HOME.welcome.focus, ""),
    `Tech stack highlights: ${HOME.techStack.map((t) => plain(t.label)).join("; ")}`,
    `Currently working on: ${SIDEBAR.current}. Currently learning: ${SIDEBAR.learning}.`,
    `Everyday setup: ${SIDEBAR.systemInfo.map((r) => `${r.label}: ${r.value}`).join("; ")}.`,
  );

  out.push("", "## Work experience (from the resume)");
  for (const e of RESUME.experience) {
    out.push(`- ${e.title} at ${e.org} (${e.period})`, bullets(e.points, "    "));
  }

  out.push("", "## Education");
  for (const e of RESUME.education) {
    out.push(`- ${e.title}, ${e.org} (${e.period})`, bullets(e.points, "    "));
  }

  out.push("", "## Professional projects (from the resume)");
  for (const p of RESUME.projects) {
    out.push(`- ${p.title}` + (p.technologies.length ? ` [${p.technologies.join(", ")}]` : ""), bullets(p.points, "    "));
    const links = p.links.filter((l) => realUrl(l.url));
    if (links.length) out.push(`    Links: ${links.map((l) => `${l.name}: ${l.url}`).join("; ")}`);
  }

  out.push("", "## Portfolio projects (the Projects page; each has a details page)");
  for (const p of PROJECTS) {
    out.push(
      `- ${p.title} (${CATEGORY_NAMES[p.category] ?? p.category}): ${plain(p.summary)}`,
      `    ${plain(p.overview)}`,
      `    Tech: ${p.tech.join(", ")}`,
    );
    const links = [
      realUrl(p.links.github) ? `GitHub: ${p.links.github}` : "",
      realUrl(p.links.demo) ? `Live demo: ${p.links.demo}` : "",
    ].filter(Boolean);
    if (links.length) out.push(`    ${links.join("; ")}`);
  }

  out.push("", "## Skills");
  for (const g of RESUME.skills) out.push(`- ${g.name}: ${g.items.join(", ")}`);

  out.push("", "## Spoken languages", ...RESUME.languages.map((l) => `- ${l.name}: ${l.level}`));

  return out.join("\n");
}
