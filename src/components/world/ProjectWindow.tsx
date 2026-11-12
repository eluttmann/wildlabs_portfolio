"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { projectCover, projectLink, type Project } from "@/content/projects";
import { Description, ExhibitLink } from "@/components/gallery/GalleryExhibit";

/** How long the window takes to settle in or fade out, in ms (matches the classes below). */
const EXIT_MS = 380;

/**
 * The project, opened from its glass card once the camera has flown up to it: a large frosted window in the visionOS
 * manner, with concentric corners (40 px outside, 28 px on the image). Escape, the close button or a tap outside
 * closes it, and the camera flies back to where the visitor stood.
 */
export function ProjectWindow({ project, onClose }: { project: Project; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const cover = projectCover(project);
  const portrait = cover?.format === "portrait";
  const link = projectLink(project);
  const title = project.exhibit?.title ?? project.title;
  const credits = project.exhibit?.credits ?? project.role;

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    closeButton.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", key);
    };
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-window-title"
      onClick={close}
      className={`fixed inset-0 z-30 grid place-items-center bg-ink/10 p-4 transition-opacity duration-[380ms] ease-out tablet:p-8 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <article
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[40px] bg-paper/60 p-3 shadow-float ring-1 ring-paper/70 backdrop-blur-2xl backdrop-saturate-150 transition duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] tablet:p-4 ${
          portrait ? "w-fit max-w-full" : "w-full max-w-[880px]"
        } ${shown ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.94]"}`}
      >
        {cover && (
          // Portrait work sets the window's width from its height, so the glass frame fits the content.
          <div
            className={`relative overflow-hidden rounded-[28px] bg-gallery-shade ${
              portrait ? "aspect-[1/2] h-[min(60dvh,720px)] max-w-full" : "aspect-video w-full"
            }`}
          >
            {cover.video ? (
              <video
                src={cover.video}
                poster={cover.src}
                aria-label={cover.alt}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes={portrait ? "360px" : "(min-width: 920px) 856px, 100vw"}
                className="object-cover"
              />
            )}
          </div>
        )}
        {/* In a portrait window the text wraps to the media's width instead of widening the glass. */}
        <div className={`px-3 pb-3 pt-5 tablet:px-5 tablet:pb-5 tablet:pt-6 ${portrait ? "w-0 min-w-full" : ""}`}>
          <h2 id="project-window-title" className="text-heading font-medium text-ink">
            {title}
          </h2>
          <p className="mt-1 text-caption text-ink-2">{credits}</p>
          <p className="mt-4 max-w-measure text-body-sm text-ink-soft tablet:text-body">
            {project.exhibit ? <Description exhibit={project.exhibit} /> : project.summary}
          </p>
          {link && (
            <ExhibitLink
              href={link.href}
              className="mt-6 inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-caption font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              {link.label}
            </ExhibitLink>
          )}
        </div>
        <button
          ref={closeButton}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-6 top-6 grid size-10 place-items-center rounded-full bg-paper/75 text-ink shadow-rim backdrop-blur-xl transition-colors outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-ink/60 tablet:right-7 tablet:top-7"
        >
          <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        </button>
      </article>
    </div>
  );
}
