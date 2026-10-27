/**
 * Long-form project pages (e.g. /ombi). Each case study hangs off its project in projects.ts, so
 * projects.ts stays the one content source for 2D, 3D and the chat.
 * Copy comes from the old 2D site (2d.ericluttmann.com) with house-style fixes only.
 */
import type { ExhibitMedia } from "@/content/projects";

/** A run of inline text: plain, or a link and/or emphasis. */
export type Run = string | { text: string; href?: string; strong?: boolean };
/** One paragraph or list item: a plain string, or runs when it carries links or emphasis. */
export type Rich = string | Run[];

export type ListItem = Rich | { text: Rich; items: Rich[] };

/** `width` and `height` on figure media are the source pixel size; the layout sets the display size. */
export interface Figure {
  media: ExhibitMedia;
  caption?: string;
}

export type CaseStudyBlock =
  | { kind: "text"; heading?: string; paragraphs: Rich[] }
  | { kind: "list"; heading?: string; ordered?: boolean; items: ListItem[] }
  /** Titled sub-points under one heading (Key design elements, Takeaways). */
  | { kind: "points"; heading?: string; points: { title: string; ordered?: boolean; items: Rich[] }[] }
  | { kind: "quotes"; heading?: string; quotes: { text: string; by: string }[] }
  /** `measure` keeps tall media (phones) in the reading column; default spans the media width. */
  | { kind: "figure"; figure: Figure; width?: "measure" | "media" }
  | { kind: "figures"; figures: Figure[] }
  /** A new chapter of the page (DBC's Order and Manage), set off by a hairline. */
  | { kind: "chapter"; title: string };

export interface CaseStudy {
  /** URL segment, kept from the old 2D site so its links can redirect one to one (e.g. "dbc" is /dbc). */
  path: string;
  tagline: string;
  role: string;
  blocks: CaseStudyBlock[];
}
