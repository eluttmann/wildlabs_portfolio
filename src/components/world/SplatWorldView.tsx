"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { projectBySlug } from "@/content/projects";
import type { WorldStatus } from "./SplatWorldScene";
import { ProjectWindow } from "./ProjectWindow";
import { RESET_VIEW_EVENT } from "./ResetViewButton";
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
export function SplatWorldView({
  world,
  intro,
  children,
}: {
  world: SplatWorld;
  /** Shown over the world from the starting viewpoint once it loads; fades for good at the visitor's first move. */
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const [status, setStatus] = useState<WorldStatus>("loading");
  const [moved, setMoved] = useState(false);
  const markMoved = useCallback(() => setMoved(true), []);
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

  // The logo in the 3D top bar: close any open project and fly back to the starting viewpoint.
  const [resetSignal, setResetSignal] = useState(0);
  useEffect(() => {
    const reset = () => {
      setOpen(null);
      setSelected(null);
      setResetSignal((n) => n + 1);
    };
    window.addEventListener(RESET_VIEW_EVENT, reset);
    return () => window.removeEventListener(RESET_VIEW_EVENT, reset);
  }, []);

  return (
    <main className="fixed inset-0 bg-gallery">
      <SplatWorldScene
        world={world}
        onStatus={setStatus}
        selected={selected}
        onSelect={select}
        onArrive={arrive}
        resetSignal={resetSignal}
        onMoved={markMoved}
      />
      {intro && (
        <div
          aria-hidden={moved || status !== "ready"}
          className={`pointer-events-none absolute inset-x-0 top-[17svh] flex justify-center px-6 transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none ${
            !moved && status === "ready" ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          {intro}
        </div>
      )}
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
