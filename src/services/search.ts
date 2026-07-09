import type { Project, BlogPost } from "../types.js";

export type SearchKind = "project" | "blog";

export interface SearchResult {
  readonly kind: SearchKind;
  readonly title: string;
  readonly route: string;
  readonly snippet: string;
  readonly score: number;
}

/**
 * A small in-memory full-text search over projects and blog posts. Kept as an
 * isolated service so it can later be swapped for a server-side search endpoint
 * without touching callers.
 */
export function search(
  query: string,
  projects: readonly Project[],
  posts: readonly BlogPost[],
): SearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const p of projects) {
    const haystack = `${p.title} ${p.summary} ${p.overview} ${p.tech.join(" ")}`.toLowerCase();
    const score = scoreOf(haystack, p.title.toLowerCase(), terms);
    if (score > 0) {
      results.push({
        kind: "project",
        title: p.title,
        route: `#/projects/${p.slug}`,
        snippet: p.summary,
        score,
      });
    }
  }

  for (const b of posts) {
    const haystack = `${b.title} ${b.summary} ${b.tags.join(" ")} ${b.body}`.toLowerCase();
    const score = scoreOf(haystack, b.title.toLowerCase(), terms);
    if (score > 0) {
      results.push({
        kind: "blog",
        title: b.title,
        route: `#/blog/${b.slug}`,
        snippet: b.summary,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function scoreOf(haystack: string, title: string, terms: string[]): number {
  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 5;
    const occurrences = haystack.split(term).length - 1;
    score += occurrences;
  }
  return score;
}
