import type { Metadata } from "next";
import { GalleryNav } from "@/components/gallery/GalleryNav";
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
      <h1 className="sr-only">Wild Labs</h1>
      {/* The bar spans the world, so only its three items catch the pointer; the rest passes through to the scene. */}
      <GalleryNav
        linkHome={false}
        className="pointer-events-none absolute inset-x-0 top-0 pl-[max(24px,env(safe-area-inset-left))] pr-[max(24px,env(safe-area-inset-right))] [&>*]:pointer-events-auto"
      >
        <ViewToggle current="3d" />
      </GalleryNav>
    </SplatWorldView>
  );
}
