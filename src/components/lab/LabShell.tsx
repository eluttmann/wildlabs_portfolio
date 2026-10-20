"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { projects, projectBySlug, REGIONS } from "@/content/projects";
import { LAYOUTS, layoutById, type LayoutId } from "@/lab/layouts";
import { matchProjects } from "@/lab/match";
import { regionColor } from "@/design/tokens";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.16em] text-ink-3">Loading world</div>,
});

/** M1 Structure Lab: the six spatial structures, switchable live over one set of orbs. */
export function LabShell() {
  const [layoutId, setLayoutId] = useState<LayoutId>("powers");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Set<string> | null>(null);

  const def = layoutById[layoutId];
  const built = useMemo(() => LAYOUTS.map((l) => ({ id: l.id, result: l.build(projects, { matches }) })), [matches]);
  const layout = built.find((b) => b.id === layoutId)?.result ?? built[0].result;
  const guideSets = useMemo(() => built.map((b) => ({ id: b.id, guides: b.result.guides })), [built]);
  const project = selected ? projectBySlug[selected] : null;

  const choose = useCallback((id: LayoutId) => {
    setSelected(null);
    setLayoutId(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= LAYOUTS.length) choose(LAYOUTS[n - 1].id);
      if (e.key === "Escape") {
        setSelected(null);
        setMatches(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose]);

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSelected(null);
    setMatches(q ? matchProjects(projects, q) : null);
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-gallery text-ink">
      <Scene layoutId={layoutId} layout={layout} guideSets={guideSets} selected={selected} matches={matches} onSelect={setSelected} />

      {/* Brand */}
      <header className="pointer-events-none absolute left-[max(16px,env(safe-area-inset-left))] top-[calc(20px+env(safe-area-inset-top))] grid gap-1.5 pl-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-3">“Structure Lab” · M1</span>
        <h1 className="text-[22px] font-bold uppercase leading-none tracking-[-0.01em]">Wild Labs</h1>
        <p className="max-w-[30ch] text-[13px] leading-snug text-ink-2">Spatial understanding and creation.</p>
      </header>

      {/* Region legend */}
      <ul className="pointer-events-none absolute right-[max(16px,env(safe-area-inset-right))] top-[calc(22px+env(safe-area-inset-top))] hidden gap-4 pr-2 text-[10px] uppercase tracking-[0.16em] text-ink-2 sm:flex">
        {Object.entries(REGIONS).map(([key, r]) => (
          <li key={key} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: regionColor[key as keyof typeof regionColor] }} />
            {r.label}
          </li>
        ))}
      </ul>

      {/* Layout switcher */}
      <nav
        aria-label="Spatial structure"
        className="absolute bottom-[calc(96px+env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] right-[max(16px,env(safe-area-inset-right))] md:bottom-[calc(24px+env(safe-area-inset-bottom))] md:right-auto md:w-[300px]"
      >
        <ol className="flex gap-1 overflow-x-auto pb-1 md:grid md:overflow-visible">
          {LAYOUTS.map((l, i) => {
            const active = l.id === layoutId;
            return (
              <li key={l.id} className="flex-none">
                <button
                  type="button"
                  onClick={() => choose(l.id)}
                  aria-pressed={active}
                  className={`flex w-full items-baseline gap-3 rounded-full px-3 py-1.5 text-left text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                    active ? "bg-ink text-gallery" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  <span className="font-medium tabular-nums opacity-60">{i + 1}</span>
                  <span className="whitespace-nowrap">{l.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 hidden max-w-[34ch] pl-3 text-[12.5px] leading-relaxed text-ink-2 md:block">{def.blurb}</p>
      </nav>

      {/* Ask bar */}
      <div className="absolute bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 grid w-[min(560px,calc(100%-32px))] -translate-x-1/2 gap-2">
        {matches && (
          <div className="flex items-center justify-center gap-3 text-[12px] text-ink-2">
            <span>
              {matches.size ? `${matches.size} ${matches.size === 1 ? "project" : "projects"} match` : "Nothing matched. Try spatial, agents, brand or video."}
            </span>
            <button type="button" className="rounded-full bg-ink/5 px-3 py-1 text-ink" onClick={() => { setMatches(null); setQuery(""); }}>
              Show all
            </button>
          </div>
        )}
        <form onSubmit={ask} className="flex items-center gap-2 rounded-full border border-line bg-white/70 py-1.5 pl-5 pr-1.5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl focus-within:border-ink/30">
          <label htmlFor="ask" className="sr-only">Ask me anything</label>
          <input
            id="ask"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything"
            className="min-w-0 flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:text-ink-3"
            autoComplete="off"
          />
          <button type="submit" aria-label="Ask" className="grid size-9 flex-none place-items-center rounded-full bg-ink text-gallery">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
        </form>
      </div>

      {/* Project panel */}
      <aside
        aria-hidden={!project}
        className={`absolute right-[max(16px,env(safe-area-inset-right))] top-[calc(64px+env(safe-area-inset-top))] w-[min(340px,calc(100%-32px))] rounded-3xl border border-line bg-white/75 p-6 backdrop-blur-xl transition-all duration-500 ${
          project ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
        }`}
      >
        {project && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-ink-2">
                <span className="size-2 rounded-full" style={{ background: regionColor[project.region] }} />
                {REGIONS[project.region].label} · {project.scale}
              </span>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="grid size-8 place-items-center rounded-full bg-ink/5">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" /></svg>
              </button>
            </div>
            <h2 className="text-[30px] font-bold leading-[1.02] tracking-[-0.02em]">{project.title}</h2>
            <div className="grid gap-0.5 text-[13px] text-ink-2">
              <span className="font-medium text-ink">{project.role}</span>
              <span>{project.org}</span>
            </div>
            <p className="text-[15px] leading-relaxed">{project.summary}</p>
            {project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="justify-self-start rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-gallery">
                Open project ↗
              </a>
            ) : (
              <span className="text-[12px] text-ink-3">No public link yet.</span>
            )}
          </div>
        )}
      </aside>
    </main>
  );
}
