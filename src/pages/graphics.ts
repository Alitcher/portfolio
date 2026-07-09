import { el } from "../components/dom.js";
import { windowEl } from "../components/window.js";
import { pageRegion } from "./shared.js";

interface GfxTopic {
  readonly name: string;
  readonly explanation: string;
  readonly pipeline: readonly string[];
  readonly metrics: string;
}

const TOPICS: readonly GfxTopic[] = [
  {
    name: "OpenGL Foundations",
    explanation:
      "A from-scratch renderer in modern C++ and OpenGL: mesh loading, camera systems, " +
      "a material model and a resource manager that keeps GPU state tidy.",
    pipeline: ["Load mesh", "Upload VBO/VAO", "Bind material", "Draw"],
    metrics: "~0.4 ms/draw batch on a mid-range GPU",
  },
  {
    name: "Deferred Rendering",
    explanation:
      "Geometry is written into a G-buffer (albedo, normal, position, roughness/metallic), " +
      "then lighting is computed in a single screen-space pass. This decouples lighting cost " +
      "from geometry complexity and scales to hundreds of lights.",
    pipeline: ["Geometry pass → G-buffer", "Light accumulation", "Composite"],
    metrics: "256 point lights at 60 FPS @ 1080p",
  },
  {
    name: "Shadow Mapping",
    explanation:
      "Depth is rendered from each light's viewpoint, then sampled during shading. Slope-scaled " +
      "bias and PCF filtering remove acne and soften edges; cascades keep large scenes crisp.",
    pipeline: ["Depth pass (light view)", "Compare in light space", "PCF filter"],
    metrics: "4-cascade CSM in ~1.1 ms",
  },
  {
    name: "PBR",
    explanation:
      "Physically based shading with the Cook-Torrance BRDF and image-based lighting, so " +
      "materials respond consistently across lighting conditions.",
    pipeline: ["BRDF (Cook-Torrance)", "IBL diffuse + specular", "Tonemap"],
    metrics: "Energy-conserving; validated against reference spheres",
  },
  {
    name: "SSAO",
    explanation:
      "Screen-space ambient occlusion samples the depth buffer around each fragment to darken " +
      "creases and contact points, grounding objects in the scene.",
    pipeline: ["Sample kernel", "Range check", "Blur"],
    metrics: "16-sample kernel in ~0.7 ms @ 1080p",
  },
  {
    name: "Bloom",
    explanation:
      "Bright pixels are thresholded, downsampled, blurred across mips and added back to create " +
      "a soft glow around emissive surfaces.",
    pipeline: ["Threshold", "Downsample + blur", "Additive composite"],
    metrics: "6-mip chain, negligible cost",
  },
  {
    name: "Future: Vulkan Experiments",
    explanation:
      "Next up: porting the core to Vulkan for explicit control over synchronisation, descriptor " +
      "management and multi-threaded command recording.",
    pipeline: ["Record command buffers", "Explicit sync", "Bindless descriptors"],
    metrics: "Planned",
  },
];

/** A retro graphics-research page. */
export async function graphicsPage(): Promise<Node> {
  const sections = TOPICS.map((topic) =>
    el(
      "article",
      { class: "gfx-topic" },
      el("h3", {}, topic.name),
      el("p", {}, topic.explanation),
      el(
        "div",
        { class: "gfx-grid" },
        el(
          "div",
          { class: "gfx-pipeline sunken" },
          el("div", { class: "gfx-label" }, "PIPELINE"),
          el(
            "div",
            { class: "pipeline-flow" },
            ...topic.pipeline.flatMap((stage, i) => {
              const box = el("span", { class: "pipeline-stage" }, stage);
              return i < topic.pipeline.length - 1
                ? [box, el("span", { class: "pipeline-arrow", html: "&rarr;" })]
                : [box];
            }),
          ),
        ),
        el(
          "div",
          { class: "gfx-metrics sunken" },
          el("div", { class: "gfx-label" }, "PERFORMANCE"),
          el("p", {}, topic.metrics),
        ),
      ),
      el(
        "div",
        { class: "gfx-footer" },
        el("span", { class: "screenshot-note" }, "[ screenshot ]"),
        el("a", { class: "details", href: "#/projects/opengl-renderer", html: "Source &raquo;" }),
      ),
    ),
  );

  const win = windowEl(
    { title: ":: COMPUTER GRAPHICS RESEARCH ::", controls: [] },
    el("p", { class: "page-intro crt-hint" }, "// Real-time rendering notes & experiments. Best viewed with the CRT filter ON."),
    ...sections,
  );

  return pageRegion(win);
}
