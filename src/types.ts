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
  /** Plain-text overview used by cards, search and the assistant. */
  readonly overview: string;
  /**
   * Rich Markdown write-up for the detail page, authored in
   * `src/content/projects/<slug>.md` and merged in at load time. Supports
   * headings, bullet lists and images. This is where the long-form overview
   * and "lessons learned" now live; the plain-text `overview` above is only
   * used by cards, search and the assistant.
   */
  readonly body?: string;
  readonly tech: readonly string[];
  readonly links: ProjectLink;
  /** True for the handful of projects surfaced on the homepage. */
  readonly featured: boolean;
  /** Visual theme key mapped to a CSS class for the pixel thumbnail. */
  readonly thumbTheme: string;
  /** Short label drawn inside the thumbnail placeholder. */
  readonly thumbLabel: string;
  /**
   * Optional path to a committed screenshot of the live site (e.g.
   * "./assets/screenshots/foo.png"). When set, cards and the detail page show
   * this real screenshot instead of the pixel-art placeholder.
   */
  readonly screenshot?: string;
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

/** A chip in the homepage "Tech Stack" panel. `chip` may contain HTML entities. */
export interface StackItem {
  readonly chipClass: string;
  readonly chip: string;
  readonly label: string;
}

/**
 * A button in the homepage "Links" panel. Provide either an explicit `href`
 * (e.g. "#/resume") or a `contactKey` that resolves to the matching value in
 * `config.contact` — keeping shared contact URLs in a single source of truth.
 */
export interface HomeLink {
  readonly iconClass: string;
  /** Icon glyph or HTML entity shown inside the button. */
  readonly icon: string;
  readonly label: string;
  readonly href?: string;
  readonly contactKey?: "github" | "linkedin" | "email";
}

/**
 * All the editable, non-list content of the homepage. Lives in
 * `src/content/home.json` so it can be edited without touching code. Featured
 * projects and blog posts are NOT here — they come from their own data sources.
 */
export interface HomeContent {
  /** Header tagline roles, rendered "|"-separated; the last gets accent styling. */
  readonly roles: readonly string[];
  readonly welcome: {
    readonly greetingHtml: string;
    /** Intro paragraphs, one entry per <p>. */
    readonly intro: readonly string[];
    readonly focusLead: string;
    /** Bullet points under the "focusing on" heading. */
    readonly focus: readonly string[];
    readonly poweredBadgeHtml: string;
  };
  readonly techStack: readonly StackItem[];
  readonly links: readonly HomeLink[];
  readonly misc: {
    readonly bestViewedHtml: string;
  };
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
}
