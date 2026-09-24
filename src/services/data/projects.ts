import type { Project } from "../../types.js";
import projectMeta from "../../content/projects.json";

/**
 * Rich Markdown write-ups, one file per project at `content/projects/<slug>.md`.
 * Loaded at build time (same mechanism as the blog) and merged onto the matching
 * project by slug. Edit these files to write overview prose, lessons and images
 * without touching any TypeScript.
 */
const bodyFiles = import.meta.glob("../../content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const bodyBySlug = new Map<string, string>(
  Object.entries(bodyFiles).map(([path, raw]) => [
    path.split("/").pop()!.replace(/\.md$/, ""),
    raw.trim(),
  ]),
);

/**
 * Structured project metadata, loaded from `src/content/projects.json` so it can
 * be edited without touching any TypeScript. A backend implementation of
 * `GET /api/projects` must return objects matching the `Project` type.
 * Long-form copy lives in the Markdown files above.
 */
const PROJECT_META = projectMeta as readonly Project[];

/** Metadata with each project's Markdown body merged in by slug. */
export const PROJECTS: readonly Project[] = PROJECT_META.map((p) => {
  const body = bodyBySlug.get(p.slug);
  return body ? { ...p, body } : p;
});
