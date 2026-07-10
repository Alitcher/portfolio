/**
 * Domain models shared across the whole application.
 *
 * These types are the contract between the data layer (`services/api`) and the
 * UI (`pages`, `components`). A future backend must return JSON matching these
 * shapes; nothing else in the app needs to change when the data source swaps.
 */

export type ProjectCategory = "xr" | "backend" | "graphics" | "gis";

export interface ProjectLink {
  readonly github?: string;
  readonly demo?: string;
}

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  /** Short one-liner used on cards. */
  readonly summary: string;
  /** Longer overview shown on the detail/category pages. */
  readonly overview: string;
  readonly tech: readonly string[];
  readonly lessons: readonly string[];
  readonly links: ProjectLink;
  /** True for the handful of projects surfaced on the homepage. */
  readonly featured: boolean;
  /** Visual theme key mapped to a CSS class for the pixel thumbnail. */
  readonly thumbTheme: string;
  /** Short label drawn inside the thumbnail placeholder. */
  readonly thumbLabel: string;
}

export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  /** ISO date string (YYYY-MM-DD). */
  readonly date: string;
  readonly readingMinutes: number;
  readonly summary: string;
  readonly tags: readonly string[];
  /** Raw markdown body. */
  readonly body: string;
}

export interface ResumeEntry {
  readonly title: string;
  readonly org: string;
  readonly period: string;
  readonly points: readonly string[];
}

export interface ResumeProject {
  readonly title: string;
  readonly technologies: readonly string[];
  readonly points: readonly string[];
  readonly links: readonly ResumeProjectLink[];
}

export interface ResumeProjectLink {
  readonly name: string;
  readonly url: string;
}

export interface SkillGroup {
  readonly name: string;
  readonly items: readonly string[];
}

export interface LanguageSkill {
  readonly name: string;
  readonly level: string;
}

export interface Resume {
  readonly education: readonly ResumeEntry[];
  readonly experience: readonly ResumeEntry[];
  readonly projects: readonly ResumeProject[];
  readonly skills: readonly SkillGroup[];
  readonly languages: readonly LanguageSkill[];
  readonly pdfUrl: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
}
