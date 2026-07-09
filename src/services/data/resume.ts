import type { Resume } from "../../types.js";

/** Canonical resume data used by the local mock API (`GET /api/resume`). */
export const RESUME: Resume = {
  education: [
    {
      title: "MSc in Computer Science (Distributed Systems)",
      org: "University of Tartu, Estonia",
      period: "2022 - 2024",
      points: [
        "Focus on software engineering, real-time graphics and distributed systems.",
        "Thesis on XR interaction design for training applications.",
      ],
    },
    {
      title: "BSc in Science and Technology (Game Art & Design)",
      org: "Thammasat University, Thailand",
      period: "2015 - 2019",
      points: [
        "Focus on software engineering, real-time graphics and distributed systems.",
        "Thesis on XR interaction design for training applications.",
      ],
    },
  ],
  experience: [
    {
      title: "XR Developer Lead (Full-time)",
      org: "Helsinki XR Center",
      period: "2025 - Present",
      points: [
        "Built VR training and education applications for Meta Quest and PCVR.",
        "Owned the cross-device interaction layer on top of the XR Interaction Toolkit.",
        "Profiled and optimised scenes to hold a stable 72–90 Hz on standalone headsets.",
      ],
    },
    {
      title: "Frontend: Unity3D Developer",
      org: "Wildchain",
      period: "Jan 2022 - Oct 2022",
      points: [
        "Developed ASP.NET Core services with RabbitMQ messaging and PostgreSQL.",
        "Containerised services with Docker for reproducible deployments.",
        "Wrote gRPC contracts for low-latency inter-service calls.",
      ],
    },
        {
      title: "Unity3D Developer | Music Ed-tech",
      org: "BNK Musicmall Co.,Ltd",
      period: "Jun 2021 - Dec 2021",
      points: [
        "Developed ASP.NET Core services with RabbitMQ messaging and PostgreSQL.",
        "Containerised services with Docker for reproducible deployments.",
        "Wrote gRPC contracts for low-latency inter-service calls.",
      ],
    },
  ],
  skills: [
    { name: "XR / Game", items: ["Unity", "C#", "OpenXR", "XR Interaction Toolkit", "Meta Quest"] },
    { name: "Graphics", items: ["C++", "OpenGL", "GLSL", "Deferred rendering", "PBR", "RenderDoc"] },
    { name: "Backend", items: ["ASP.NET Core", "RabbitMQ", "gRPC", "PostgreSQL", "Docker"] },
    { name: "Web / Tooling", items: ["TypeScript", "Vite", "Node.js", "Git", "Linux"] },
  ],
  languages: [
    { name: "Finnish", level: "Native" },
    { name: "English", level: "Fluent" },
    { name: "Swedish", level: "Intermediate" },
  ],
  pdfUrl: "./assets/resume.pdf",
};
