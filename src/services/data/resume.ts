import type { Resume } from "../../types.js";
import resumeContent from "../../content/resume.json";

/**
 * Canonical resume data used by the local mock API (`GET /api/resume`), loaded
 * from `src/content/resume.json` so it can be edited without touching any
 * TypeScript.
 */
export const RESUME: Resume = resumeContent as Resume;
