import type { Metadata } from "next";
import { ViewToggle } from "@/components/shell/ViewToggle";
import { SplatWorldView } from "@/components/world/SplatWorldView";
import { homeWorld } from "@/components/world/worlds";

export const metadata: Metadata = {
  title: "Wild Labs: 3D",
};

/**
 * The home page in 3D: the home world (El Capitan Meadow) with the project orbs. Visitors reach it as `/?view=3d`,
 * rewritten here in next.config.ts. The world's settings live in src/components/world/worlds.ts, shared with the
 * /spikes/yosemite workbench; the Structure Lab that used to live here is at /structure.
 */
export default function WorldPage() {
  return (
    <SplatWorldView world={homeWorld}>
      <header className="pointer-events-none absolute left-[max(16px,env(safe-area-inset-left))] top-[calc(20px+env(safe-area-inset-top))] grid gap-1.5 pl-2">
        <h1 className="text-[22px] font-bold uppercase leading-none tracking-[-0.01em] text-ink">Wild Labs</h1>
        <p className="max-w-[30ch] text-[13px] leading-snug text-ink-2">Spatial understanding and creation.</p>
      </header>
      <ViewToggle
        current="3d"
        className="absolute right-[max(16px,env(safe-area-inset-right))] top-[calc(16px+env(safe-area-inset-top))] md:right-auto md:left-1/2 md:-translate-x-1/2"
      />
    </SplatWorldView>
  );
}
