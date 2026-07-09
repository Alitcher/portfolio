import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { pageRegion, backLink, formatDate } from "./shared.js";
import { api } from "../services/api.js";
import { renderMarkdown } from "../services/markdown.js";

/** Blog index: a list of articles loaded from Markdown. */
export async function blogPage(): Promise<Node> {
  const posts = await api.getBlogPosts();

  const list = el(
    "div",
    { class: "blog-index" },
    ...posts.map((post) =>
      el(
        "article",
        { class: "blog-entry" },
        el("h3", {}, el("a", { href: `#/blog/${post.slug}` }, post.title)),
        el(
          "div",
          { class: "blog-meta" },
          formatDate(post.date),
          " · ",
          `${post.readingMinutes} min read`,
          post.tags.length ? " · " + post.tags.map((t) => `#${t}`).join(" ") : "",
        ),
        el("p", {}, post.summary),
        el("a", { class: "details", href: `#/blog/${post.slug}`, html: "Read more &raquo;" }),
      ),
    ),
  );

  return pageRegion(windowEl({ title: ":: BLOG / NOTES ::", controls: [] },
    el("p", { class: "page-intro" }, "Technical notes on XR, graphics and backend systems."),
    list,
  ));
}

/** Single blog article with previous/next navigation. */
export async function blogPostPage(slug: string): Promise<Node> {
  const posts = await api.getBlogPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? posts[index] : undefined;

  if (!post) {
    return pageRegion(windowEl({ title: ":: POST NOT FOUND ::", controls: [] },
      el("p", {}, "That article doesn't exist."),
      backLink("#/blog", "Back to Blog"),
    ));
  }

  // Posts are sorted newest-first; "previous" is the older one (higher index).
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index < posts.length - 1 ? posts[index + 1] : undefined;

  const nav = el(
    "nav",
    { class: "post-nav", attrs: { "aria-label": "Post navigation" } },
    older
      ? el("a", { class: "prev", href: `#/blog/${older.slug}`, html: `&laquo; ${older.title}` })
      : el("span", {}),
    newer
      ? el("a", { class: "next", href: `#/blog/${newer.slug}`, html: `${newer.title} &raquo;` })
      : el("span", {}),
  );

  const article = el(
    "article",
    { class: "blog-article" },
    el("div", { class: "blog-meta" },
      formatDate(post.date), " · ", `${post.readingMinutes} min read`),
    el("div", { class: "markdown", html: renderMarkdown(post.body) }),
  );

  return pageRegion(windowEl({ title: `:: ${post.title.toUpperCase()} ::`, controls: [] },
    backLink("#/blog", "Back to Blog"),
    article,
    nav,
  ));
}
