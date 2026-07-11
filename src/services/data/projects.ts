import type { Project } from "../../types.js";

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
 * Structured project metadata used by the local mock API. A backend
 * implementation of `GET /api/projects` must return objects matching the
 * `Project` type. Long-form copy lives in the Markdown files above.
 */
const PROJECT_META: readonly Project[] = [
  {
    slug: "cosplay-event-map",
    title: "CosoraAtlas",
    category: "gis",
    summary: "Web map for anime & cosplay events across the Nordics & Baltics.",
    overview:
      "This is my first solo web project showcasing my coding skills! <br><br>" +
      "CosoraAtlas is an interactive web map that aggregates anime, manga and cosplay events across the " +
      "Nordic and Baltic region. Users filter by date, category and country, and event " +
      "organisers submit new entries through a moderated pipeline.",
    tech: ["TypeScript", "React", "Leaflet", "MapLibre GL", "NestJS", "PostgreSQL"],
    links: { github: "https://github.com/Alitcher/CosGisClient", demo: "https://cosoraatlas.vercel.app/" },
    featured: true,
    thumbTheme: "map",
    thumbLabel: "&#128205; MAP",
    screenshot: "./assets/screenshots/cosoraatlas.png",
  },
  {
    slug: "opengl-renderer",
    title: "OpenGL Renderer",
    category: "graphics",
    summary: "Personal rendering engine in C++ & OpenGL. Deferred shading, PBR.",
    overview:
      "A from-scratch real-time rendering engine written in modern C++ and OpenGL. It " +
      "implements a deferred pipeline with physically based shading, shadow mapping, SSAO " +
      "and bloom, and doubles as a testbed for graphics techniques.",
    tech: ["C++", "OpenGL", "GLSL", "GLFW", "Assimp"],
    links: { github: "https://github.com/", demo: "" },
    featured: true,
    thumbTheme: "dragon",
    thumbLabel: "&#128009; GL",
  },
  {
    slug: "flair-ue5-thesis",
    title: "Flair UE5 Thesis",
    category: "graphics",
    summary: "My master thesis defended in 2024.",
    overview:
      "A from-scratch real-time rendering engine written in modern C++ and OpenGL. It " +
      "implements a deferred pipeline with physically based shading, shadow mapping, SSAO " +
      "and bloom, and doubles as a testbed for graphics techniques.",
    tech: ["C++", "OpenGL", "GLSL", "GLFW", "Assimp"],
    links: { github: "https://github.com/", demo: "" },
    featured: true,
    thumbTheme: "dragon",
    thumbLabel: "&#128009; GL",
  },
  {
    slug: "message-bus-services",
    title: "Distributed Message Bus",
    category: "backend",
    summary: "Event-driven microservices over RabbitMQ with gRPC and Docker.",
    overview:
      "A set of event-driven microservices communicating over RabbitMQ, with gRPC for " +
      "synchronous calls and PostgreSQL for persistence. The whole stack is containerised " +
      "and reproducible with a single docker compose up.",
    tech: ["ASP.NET Core", "RabbitMQ", "gRPC", "PostgreSQL", "Docker"],
    links: { github: "https://github.com/", demo: "" },
    featured: false,
    thumbTheme: "backend",
    thumbLabel: "BUS",
  },
];

/** Metadata with each project's Markdown body merged in by slug. */
export const PROJECTS: readonly Project[] = PROJECT_META.map((p) => {
  const body = bodyBySlug.get(p.slug);
  return body ? { ...p, body } : p;
});
