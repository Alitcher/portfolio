import type { Project } from "../../types.js";

/**
 * Canonical project data used by the local mock API. A backend implementation
 * of `GET /api/projects` must return objects matching the `Project` type.
 */
export const PROJECTS: readonly Project[] = [
    {
    slug: "cosplay-event-map",
    title: "CosoraAtlas",
    category: "gis",
    summary: "Web map for anime & cosplay events across the Nordics & Baltics.",
    overview:
      "An interactive web map that aggregates anime, manga and cosplay events across the " +
      "Nordic and Baltic region. Users filter by date, category and country, and event " +
      "organisers submit new entries through a moderated pipeline.",
    tech: ["TypeScript", "Leaflet", "PostGIS", "ASP.NET Core", "PostgreSQL"],
    lessons: [
      "Modelling geospatial data cleanly with PostGIS.",
      "Clustering hundreds of markers without janky panning.",
      "Building a lightweight moderation workflow for submissions.",
    ],
    links: { github: "https://github.com/Alitcher/CosGisClient", demo: "" },
    featured: true,
    thumbTheme: "map",
    thumbLabel: "&#128205; MAP",
  },
  {
    slug: "aistart",
    title: "AIStart",
    category: "xr",
    summary: "XR education platform about AI & drone delivery. Built with Unity XR.",
    overview:
      "AIStart is an immersive XR learning experience that teaches the fundamentals of " +
      "artificial intelligence and autonomous drone delivery. Learners walk through a " +
      "virtual city, dispatch delivery drones, and watch pathfinding and decision-making " +
      "unfold in real time.",
    tech: ["Unity", "C#", "OpenXR", "XR Interaction Toolkit", "Meta Quest 3"],
    lessons: [
      "Designing diegetic UI that stays readable inside a headset.",
      "Keeping frame time under budget while simulating many agents.",
      "Onboarding non-technical users into VR with zero instructions.",
    ],
    links: { github: "https://github.com/", demo: "" },
    featured: true,
    thumbTheme: "aistart",
    thumbLabel: "AI START",
  },
  {
    slug: "vr-factory",
    title: "VR Factory",
    category: "xr",
    summary: "VR training simulation for factory layout & safety. Multi-platform with XR.",
    overview:
      "A VR training simulation that lets operators rehearse factory floor layout, machine " +
      "operation and safety procedures before ever stepping onto a real line. Built to run " +
      "across tethered PCVR and standalone Quest headsets from a single codebase.",
    tech: ["Unity", "C#", "XR Interaction Toolkit", "OpenXR", "Addressables"],
    lessons: [
      "Abstracting device input so one interaction layer serves every headset.",
      "Streaming large factory scenes with Addressables to fit memory budgets.",
      "Building repeatable, measurable training scenarios.",
    ],
    links: { github: "https://github.com/", demo: "" },
    featured: true,
    thumbTheme: "factory",
    thumbLabel: "VR FACTORY",
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
    lessons: [
      "Structuring a deferred G-buffer for extensibility.",
      "Debugging GPU state with RenderDoc as a daily habit.",
      "Balancing PBR correctness against real-time performance.",
    ],
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
    lessons: [
      "Designing idempotent consumers for at-least-once delivery.",
      "Tracing a request across service boundaries.",
      "Keeping local dev environments reproducible with Docker.",
    ],
    links: { github: "https://github.com/", demo: "" },
    featured: false,
    thumbTheme: "backend",
    thumbLabel: "BUS",
  },
];
