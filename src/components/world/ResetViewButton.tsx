"use client";

import type { ReactNode } from "react";

/** Broadcast by the 3D top bar's logo; SplatWorldView closes any open project and flies the camera to the start. */
export const RESET_VIEW_EVENT = "wildlabs:reset-view";

/** Wraps the logo on the 3D home: a click returns the visitor to the starting viewpoint. */
export function ResetViewButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Wild Labs: back to the starting view"
      onClick={() => window.dispatchEvent(new Event(RESET_VIEW_EVENT))}
      className={`cursor-pointer rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper ${className}`}
    >
      {children}
    </button>
  );
}
