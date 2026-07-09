import type { BlogPost } from "../../types.js";

/**
 * Loads blog posts from Markdown files at build time via Vite's `import.meta.glob`.
 * Each file carries YAML-ish frontmatter (title, date, readingMinutes, summary,
 * tags) followed by the markdown body.
 *
 * A backend implementation of `GET /api/blog` would return the same `BlogPost`
 * shape, so pages remain identical regardless of source.
 */
const files = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const BLOG_POSTS: readonly BlogPost[] = Object.entries(files)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

function parsePost(path: string, raw: string): BlogPost {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);

  const meta: Record<string, string> = {};
  let body = raw;
  if (match) {
    body = match[2];
    for (const line of match[1].split("\n")) {
      const kv = /^(\w+):\s*(.*)$/.exec(line.trim());
      if (kv) meta[kv[1]] = kv[2].trim();
    }
  }

  const tags = (meta.tags ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "1970-01-01",
    readingMinutes: Number(meta.readingMinutes) || estimateReadingMinutes(body),
    summary: meta.summary ?? "",
    tags,
    body: body.trim(),
  };
}

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
