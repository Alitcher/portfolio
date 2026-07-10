import type { HomeContent } from "../../types.js";
import homeContent from "../../content/home.json";

/**
 * Editable homepage content, loaded from `src/content/home.json`.
 *
 * Keeping the welcome text, tech stack, links and misc panel in a plain JSON
 * file means the copy can be edited by hand without touching any TypeScript.
 * A backend implementation of `GET /api/home` would return this same shape.
 */
export const HOME: HomeContent = homeContent as HomeContent;
