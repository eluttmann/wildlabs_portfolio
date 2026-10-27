"use client";

import Link, { useLinkStatus } from "next/link";

export type View = "2d" | "3d";

const VIEWS = [
  { id: "2d", label: "2D", href: "/" },
  { id: "3d", label: "3D", href: "/?view=3d" },
] as const;

/**
 * Switches the home between the 2D gallery and the 3D world: a glossy white puck in a knurled chrome
 * rim. The puck slides as soon as the other side is pressed, before its route arrives.
 */
export function ViewToggle({ current, className = "" }: { current: View; className?: string }) {
  // The other side's label marks itself pending; the puck follows it there through `group-has`.
  const puck =
    current === "2d" ? "translate-x-0 group-has-[[data-pending]]:translate-x-full" : "translate-x-full group-has-[[data-pending]]:translate-x-0";

  return (
    <nav aria-label="View" className={`rounded-full bg-(image:--rim-knurl) p-[1.5px] shadow-rim ${className}`}>
      <div className="group relative grid grid-cols-2 rounded-full bg-(image:--gloss-track) p-[3px] shadow-track">
        <span
          aria-hidden
          className={`absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-(image:--gloss-puck) shadow-puck transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${puck}`}
        />
        {VIEWS.map((v) => {
          const active = v.id === current;
          return (
            <Link
              key={v.id}
              href={v.href}
              aria-current={active ? "page" : undefined}
              className={`relative grid h-[30px] w-[46px] place-items-center rounded-full text-[11px] font-bold tracking-[0.06em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active ? "text-ink" : "text-ink-3 hover:text-ink-2"
              }`}
            >
              {active ? v.label : <PendingLabel label={v.label} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PendingLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return <span data-pending={pending || undefined}>{label}</span>;
}
