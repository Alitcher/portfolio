import { escapeHtml } from "../components/dom.js";

/**
 * A deliberately tiny, dependency-free Markdown -> HTML renderer. It supports the
 * subset used by the blog and project write-ups: headings, bold/italic/inline-code,
 * links, images, blockquotes, unordered and ordered lists, horizontal rules and
 * paragraphs.
 *
 * Everything is HTML-escaped first, so raw markdown can never inject markup.
 */
export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  let inUl = false;
  let inOl = false;
  let paragraph: string[] = [];

  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") { flushParagraph(); closeLists(); continue; }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph(); closeLists();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushParagraph(); closeLists();
      out.push("<hr />");
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph(); closeLists();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushParagraph();
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushParagraph();
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeLists();
  return out.join("\n");
}

/** Inline formatting: escape first, then re-introduce a safe subset of markup. */
function inline(text: string): string {
  let s = escapeHtml(text);
  // `code`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // **bold**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // *italic*
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // ![alt](url) images - must run before links; only http(s)/relative sources
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const safe = /^(https?:\/\/|\.?\/|#)/.test(url) ? url : "";
    return safe ? `<img src="${safe}" alt="${alt}" loading="lazy" />` : "";
  });
  // [text](url) - only http(s) and relative links allowed
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safe = /^(https?:\/\/|\.?\/|#|mailto:)/.test(url) ? url : "#";
    return `<a href="${safe}">${label}</a>`;
  });
  return s;
}
