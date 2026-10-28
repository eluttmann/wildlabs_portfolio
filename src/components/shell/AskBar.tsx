"use client";

import { useState, type FormEvent } from "react";

/**
 * The floating glass ask bar shared by the 2D gallery and the 3D world. `count` is how many projects
 * the last question matched, or null when nothing has been asked. The caller positions it.
 */
export function AskBar({
  count,
  onAsk,
  onClear,
  className = "",
}: {
  count: number | null;
  onAsk: (query: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAsk(query.trim());
  };

  return (
    <div className={`grid w-[min(560px,calc(100%-32px))] gap-2 ${className}`}>
      {count !== null && (
        <div className="flex items-center justify-center gap-3 justify-self-center rounded-full border border-white/60 bg-white/40 py-1 pr-1 pl-4 text-[12px] text-ink-2 shadow-float backdrop-blur-2xl backdrop-saturate-150">
          <span>{count ? `${count} ${count === 1 ? "project" : "projects"} match` : "Nothing matched. Try spatial, agents, brand or video."}</span>
          <button
            type="button"
            className="rounded-full bg-ink/5 px-3 py-1 text-ink hover:bg-ink/10"
            onClick={() => {
              setQuery("");
              onClear();
            }}
          >
            Show all
          </button>
        </div>
      )}
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/35 py-1.5 pr-1.5 pl-5 shadow-float backdrop-blur-2xl backdrop-saturate-150 transition-[translate,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:-translate-y-0.5 focus-within:border-white/80 focus-within:shadow-float-lift motion-reduce:transition-none"
      >
        <label htmlFor="ask" className="sr-only">
          Ask me anything
        </label>
        <input
          id="ask"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything"
          className="min-w-0 flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:text-ink-3"
          autoComplete="off"
        />
        <button type="submit" aria-label="Ask" className="grid size-9 flex-none place-items-center rounded-full bg-ink text-gallery">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </form>
    </div>
  );
}
