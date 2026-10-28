"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { AskBar } from "@/components/shell/AskBar";
import { projects } from "@/content/projects";
import { matchProjects } from "@/lab/match";

const Matches = createContext<Set<string> | null>(null);

const exhibitId = (slug: string) => `exhibit-${slug}`;

/**
 * The ask bar in the 2D gallery: a question fades the exhibits that don't match and scrolls to the
 * first one that does. `order` is the hanging order, so "first" means first on the wall.
 */
export function GalleryAsk({ order, children }: { order: string[]; children: ReactNode }) {
  const [matches, setMatches] = useState<Set<string> | null>(null);

  const ask = (query: string) => {
    if (!query) return setMatches(null);
    const hits = matchProjects(projects, query);
    const shown = new Set(order.filter((slug) => hits.has(slug)));
    setMatches(shown);
    const first = order.find((slug) => shown.has(slug));
    if (!first) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(exhibitId(first))?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <Matches value={matches}>
      {children}
      <AskBar
        count={matches ? matches.size : null}
        onAsk={ask}
        onClear={() => setMatches(null)}
        className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2"
      />
    </Matches>
  );
}

/** Wraps one exhibit so a question can fade it back or bring it forward. */
export function ExhibitFrame({ slug, children }: { slug: string; children: ReactNode }) {
  const matches = use(Matches);
  const dimmed = matches !== null && !matches.has(slug);
  return (
    <div id={exhibitId(slug)} className={`transition-opacity duration-700 motion-reduce:transition-none ${dimmed ? "opacity-15" : ""}`}>
      {children}
    </div>
  );
}
