/**
 * AliciaAI's system prompt and model settings.
 *
 * The text lives in src/content/persona.json (editable by hand or in the
 * editor under "AI assistant"):
 *   identity   — who the assistant is (one paragraph)
 *   knowledge  — extra facts it may share that the site's content doesn't say
 *   rules      — hard do's and don'ts
 *   style      — tone and formatting
 *   boundaries — what to refuse / how to deflect
 *   model      — OpenAI model id (e.g. "gpt-4o-mini" cheap/fast, "gpt-4o"
 *                smarter), temperature (0 = focused, 1 = creative) and the
 *                max tokens per reply
 *
 * The facts about your experience, projects and skills are NOT in persona.json:
 * they come from src/content/ automatically (see content-knowledge.ts), so
 * updating the site updates the assistant too. Changes go live on redeploy.
 */
import personaContent from "../content/persona.json";
import { contentKnowledge } from "./content-knowledge.js";

export interface PersonaContent {
  readonly name: string;
  readonly identity: string;
  readonly knowledge: readonly string[];
  readonly rules: readonly string[];
  readonly style: readonly string[];
  readonly boundaries: readonly string[];
  readonly model: { readonly model: string; readonly temperature: number; readonly maxTokens: number };
}

export const persona = personaContent as PersonaContent;

/** The AI engine knobs, from persona.json's "model". */
export const aiSettings = persona.model;

// Built once per server instance: the content only changes with a new deploy.
const CONTENT_KNOWLEDGE = contentKnowledge();

const list = (items: readonly string[]) => items.map((i) => `- ${i.trim()}`).join("\n");

/**
 * Assembles the full system prompt from persona.json plus the facts generated
 * from the site's content files.
 */
export function buildSystemPrompt(): string {
  return [
    persona.identity.trim(),
    "\n# What you know\n" + list(persona.knowledge) + "\n\n" + CONTENT_KNOWLEDGE,
    "\n# Rules (always follow)\n" + list(persona.rules),
    "\n# Style\n" + list(persona.style),
    "\n# Boundaries\n" + list(persona.boundaries),
  ].join("\n");
}
