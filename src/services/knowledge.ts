import type { ChatMessage } from "../types.js";
import { PROJECTS } from "./data/projects.js";
import { RESUME } from "./data/resume.js";
import { BLOG_POSTS } from "./data/blog.js";
import { config } from "../config.js";

/**
 * The local "AliciaAI" brain. Given the conversation, it produces a reply by
 * matching intent keywords against the same structured data the rest of the site
 * uses. This keeps the offline demo answers accurate and self-consistent.
 *
 * When a real backend is configured this module is bypassed entirely in favour
 * of `POST /api/chat`.
 */
export function answerQuestion(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content ?? "").toLowerCase();

  if (!q.trim()) return greeting();
  if (matches(q, ["hello", "hi", "hey", "greetings"])) return greeting();

  if (matches(q, ["xr", "vr", "ar", "unity", "quest", "headset", "immersive"])) {
    const xr = PROJECTS.filter((p) => p.category === "xr");
    return (
      `Alicia is a Unity XR developer working with OpenXR and the XR Interaction Toolkit, ` +
      `targeting Meta Quest and PCVR. XR projects include ` +
      `${xr.map((p) => p.title).join(" and ")}. ` +
      `${xr[0]?.overview ?? ""}`
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

  if (matches(q, ["skill", "tech", "stack", "language", "tools", "know"])) {
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

  return (
    `I can tell you about Alicia's Unity XR work, backend systems, computer graphics ` +
    `projects, resume, education, skills or blog posts. What would you like to know?`
  );
}

function greeting(): string {
  return (
    `Hi! I'm AliciaAI. I can answer questions about Alicia's projects, skills, XR and ` +
    `backend experience, computer graphics work, education and blog. What are you curious about?`
  );
}

function matches(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}
