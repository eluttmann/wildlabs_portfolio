import type { Project } from "@/content/projects";

/**
 * Local keyword matching for the lab's ask bar.
 * M2 replaces this with the grounded LLM director (/api/chat tool calls).
 */
const STOP = new Set(["the", "and", "for", "with", "show", "me", "eric", "work", "project", "projects", "about", "what", "has", "his", "any"]);

export function matchProjects(projects: Project[], query: string): Set<string> {
  const toks = query
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
  const hits = new Set<string>();
  for (const p of projects) {
    const hay = [...p.keywords, p.region, p.scale, p.title.toLowerCase(), ...p.roles];
    if (toks.some((t) => hay.some((h) => h.startsWith(t)))) hits.add(p.slug);
  }
  return hits;
}
