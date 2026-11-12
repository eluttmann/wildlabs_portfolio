"use client";

import { useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { projectBySlug } from "@/content/projects";
import type { WorldStatus } from "./SplatWorldScene";
import { ProjectWindow } from "./ProjectWindow";
import type { SplatWorld } from "./worlds";

const SplatWorldScene = dynamic(() => import("./SplatWorldScene"), { ssr: false });

const STATUS_COPY: Record<WorldStatus, string | null> = {
  loading: "Loading world",
  ready: null,
  error: "This world isn't available here yet",
};

/**
 * Full-screen splat world with its project cards; the label stays in the gallery frame, outside the image. Picking a
 * card flies the camera up to it, then opens the project's window; closing it flies the camera back. Children overlay
 * the world.
 */
export function SplatWorldView({ world, children }: { world: SplatWorld; children?: ReactNode }) {
  const [status, setStatus] = useState<WorldStatus>("loading");
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const message = STATUS_COPY[status];
  const project = open ? projectBySlug[open] : null;

  const select = useCallback((slug: string) => setSelected((s) => s ?? slug), []);
  const arrive = useCallback((slug: string) => setOpen(slug), []);
  const close = useCallback(() => {
    setOpen(null);
    setSelected(null);
  }, []);

  return (
    <main className="fixed inset-0 bg-gallery">
      <SplatWorldScene world={world} onStatus={setStatus} selected={selected} onSelect={select} onArrive={arrive} />
      {message && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.16em] text-ink-3">
          {message}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.16em] text-paper text-shadow-sm">
        {world.label}
      </div>
      {/* The cards are drawn in WebGL; screen-reader and keyboard visitors open the same projects from this list. */}
      <nav aria-label="Projects" className="sr-only">
        <ul>
          {world.cards.map(({ slug }) => {
            const p = projectBySlug[slug];
            return p ? (
              <li key={slug}>
                <button type="button" onClick={() => select(slug)}>
                  {p.title}
                </button>
              </li>
            ) : null;
          })}
        </ul>
      </nav>
      {children}
      {project && <ProjectWindow key={project.slug} project={project} onClose={close} />}
    </main>
  );
}
