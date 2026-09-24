import type { SidebarContent } from "../../types.js";
import sidebarContent from "../../content/sidebar.json";

/**
 * Editable left-sidebar content (system info, coffee level, current/learning,
 * music, status labels), loaded from `src/content/sidebar.json`.
 */
export const SIDEBAR: SidebarContent = sidebarContent as SidebarContent;
