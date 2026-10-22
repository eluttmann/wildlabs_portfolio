"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { WorldStatus } from "./SplatWorldScene";
import type { SplatWorld } from "./worlds";

const SplatWorldScene = dynamic(() => import("./SplatWorldScene"), { ssr: false });

const STATUS_COPY: Record<WorldStatus, string | null> = {
  loading: "Loading world",
  ready: null,
  error: "This world isn't available here yet",
};

/** Full-screen splat world with its orbs; the label stays in the gallery frame, outside the image. */
export function SplatWorldView({ world }: { world: SplatWorld }) {
  const [status, setStatus] = useState<WorldStatus>("loading");
  const message = STATUS_COPY[status];

  return (
    <main className="fixed inset-0 bg-gallery">
      <SplatWorldScene world={world} onStatus={setStatus} />
      {message && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.16em] text-ink-3">
          {message}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.16em] text-ink">
        {world.label}
      </div>
    </main>
  );
}
