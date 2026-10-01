import type { ChatMessage } from "../types.js";
import { PROJECTS } from "./data/projects.js";
import { RESUME } from "./data/resume.js";
import { BLOG_POSTS } from "./data/blog.js";
import { config } from "../config.js";

/**
 * The local "AliciaAI" brain. Given the conversation, it produces a reply by
 * matching intent keywords against the same structured data the rest of the site
 * uses. This keeps the offline answers accurate and self-consistent.
 *
 * It's only the fallback: the chat normally uses the real AI (`POST /api/chat`)
 * and only lands here, clearly labelled as a basic answer, when that can't be
 * reached (see chatWithFallback() in services/api.ts).
 */
export function answerQuestion(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content ?? "").toLowerCase().trim();

  if (!q) return greeting();
  if (matches(q, ["hello", "hi", "hey", "greetings"]) && q.split(/\s+/).length <= 3) return greeting();

  // "Can she ...?" / "Does she ...?": answer Yes/No first, like the real AI does.
  const yesNo = /^(can|could|does|do|did|is|was|are|has|have|will|would)\b/.test(q);
  const answer = topicAnswer(q);
  if (answer === null) {
    return yesNo
      ? `I don't know - that isn't in the information I have. You can ask Alicia directly at ${config.contact.email}.`
      : `I don't have information about that. I can tell you about Alicia's Unity XR work, backend systems, ` +
          `computer graphics projects, resume, education, skills or blog posts.`;
  }
  return yesNo ? `Yes - ${answer}` : answer;
}

/** The answer for the first topic the question mentions, or null if none. */
function topicAnswer(q: string): string | null {
  if (matches(q, ["xr", "vr", "ar", "unity", "quest", "headset", "immersive"])) {
    const xr = PROJECTS.filter((p) => p.category === "xr");
    return (
      `Alicia is a Unity XR developer working with OpenXR and the XR Interaction Toolkit, ` +
      `targeting Meta Quest and PCVR.` +
      (xr.length ? ` XR projects include ${xr.map((p) => p.title).join(" and ")}. ${xr[0]!.overview}` : "")
    );
  }

  if (matches(q, ["backend", "rabbitmq", "grpc", "postgres", "docker", "distributed", "api", "microservice"])) {
    const be = PROJECTS.find((p) => p.category === "backend");
    return (
      `On the backend, Alicia builds event-driven services with ASP.NET Core, RabbitMQ, ` +
      `gRPC, PostgreSQL and Docker. ${be ? be.overview : ""}`
    );
  }

  if (matches(q, ["graphics", "opengl", "vulkan", "render", "shader", "shadow", "pbr", "ssao", "bloom"])) {
    const gfx = PROJECTS.find((p) => p.category === "graphics");
    return (
      `Alicia writes real-time graphics in C++ and OpenGL. ${gfx ? gfx.overview : ""} ` +
      `The renderer covers deferred shading, shadow mapping, PBR, SSAO and bloom, with ` +
      `Vulkan experiments planned next.`
    );
  }

  if (matches(q, ["project", "portfolio", "work", "built", "made"])) {
    return (
      `Featured projects: ` +
      PROJECTS.filter((p) => p.featured)
        .map((p) => `${p.title} (${p.summary})`)
        .join("; ") +
      `. Ask about any of them, or visit the Projects page for details.`
    );
  }

  if (matches(q, ["resume", "cv", "experience", "job", "work history", "career"])) {
    const exp = RESUME.experience[0];
    return (
      `Alicia currently works as a ${exp.title} at ${exp.org} (${exp.period}). ` +
      `${exp.points[0]} You can download the full resume from the Resume page.`
    );
  }

  if (matches(q, ["education", "study", "studied", "degree", "university", "school"])) {
    const edu = RESUME.education[0];
    return `${edu.title}, ${edu.org} (${edu.period}). ${edu.points.join(" ")}`;
  }

  if (matches(q, ["skill", "tech", "stack", "language", "tools"])) {
    return (
      `Core skills: ` +
      RESUME.skills.map((g) => `${g.name} — ${g.items.join(", ")}`).join(" | ") +
      `.`
    );
  }

  if (matches(q, ["blog", "article", "post", "writing", "notes", "research"])) {
    return (
      `Recent writing: ` +
      BLOG_POSTS.slice(0, 4).map((p) => `"${p.title}"`).join(", ") +
      `. Head to the Blog page to read them in full.`
    );
  }

  if (matches(q, ["contact", "email", "reach", "hire", "linkedin", "github"])) {
    return (
      `You can reach Alicia by email at ${config.contact.email}, or via the links on the ` +
      `Contact page (GitHub, LinkedIn). Location: ${config.contact.location}.`
    );
  }

  const named = PROJECTS.find((p) => q.includes(p.title.toLowerCase()) || q.includes(p.slug));
  if (named) {
    return `${named.title}: ${named.overview} Tech: ${named.tech.join(", ")}.`;
  }

  return null;
}

function greeting(): string {
  return (
    `Hi! I'm AliciaAI. I can answer questions about Alicia's projects, skills, XR and ` +
    `backend experience, computer graphics work, education and blog. What are you curious about?`
  );
}

// Whole words only, so "hi" doesn't match "which" and "ar" doesn't match "are".
// Longer keywords may be the start of a word ("project" matches "projects").
function matches(text: string, keywords: string[]): boolean {
  return keywords.some((k) => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(k.length <= 3 ? `\\b${escaped}\\b` : `\\b${escaped}`).test(text);
  });
}
