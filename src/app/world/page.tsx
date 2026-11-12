import type { Metadata } from "next";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { ViewToggle } from "@/components/shell/ViewToggle";
import { SplatWorldView } from "@/components/world/SplatWorldView";
import { homeWorld } from "@/components/world/worlds";

export const metadata: Metadata = {
  title: "Wild Labs",
  description: "Eric Luttmann's work as glass cards in El Capitan Meadow: 3D and AI products that open access to knowledge and creation.",
};

/**
 * The home page, in 3D by default: the home world (El Capitan Meadow) with the project cards. Visitors reach it at
 * `/`, rewritten here in next.config.ts (`/?view=2d` is the gallery). The world's settings live in
 * src/components/world/worlds.ts, shared with the /spikes/yosemite workbench; the Structure Lab is at /structure.
 */
export default function WorldPage() {
  return (
    <SplatWorldView world={homeWorld}>
      <h1 className="sr-only">Wild Labs</h1>
      {/* The bar spans the world, so only the toggle and ABOUT catch the pointer; the rest, including the inert logo,
          passes through to the scene. Over the world its text is white with a soft shadow, legible on sky and granite. */}
      <GalleryNav
        linkHome={false}
        className="pointer-events-none absolute inset-x-0 top-0 pl-[max(24px,env(safe-area-inset-left))] pr-[max(24px,env(safe-area-inset-right))] text-paper text-shadow-sm [&>:not(img)]:pointer-events-auto"
      >
        <ViewToggle current="3d" />
      </GalleryNav>
    </SplatWorldView>
  );
}
