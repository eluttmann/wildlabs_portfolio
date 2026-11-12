import type { Metadata } from "next";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { ViewToggle } from "@/components/shell/ViewToggle";
import { SplatWorldView } from "@/components/world/SplatWorldView";
import { homeWorld } from "@/components/world/worlds";
import { HEADLINE, HEADLINE_LINES } from "@/content/site";

export const metadata: Metadata = {
  title: "Wild Labs",
  description: "Eric Luttmann's work as glass cards in El Capitan Meadow: 3D and AI products that open access to understanding and action.",
};

/**
 * The home page, in 3D by default: the home world (El Capitan Meadow) with the project cards. Visitors reach it at
 * `/`, rewritten here in next.config.ts (`/?view=2d` is the gallery). The world's settings live in
 * src/components/world/worlds.ts, shared with the /spikes/yosemite workbench; the Structure Lab is at /structure.
 */
export default function WorldPage() {
  return (
    <SplatWorldView
      world={homeWorld}
      intro={
        // The thesis over the sky on arrival, set like the 2D hero; it fades once the visitor turns or walks.
        <p className="w-[344px] max-w-full text-center text-[28px] leading-[1.2] font-bold tracking-[0.02em] text-paper uppercase text-shadow-md tablet:w-[640px] tablet:text-[40px]">
          {HEADLINE_LINES.map((line) => (
            <span key={line} className="tablet:block">
              {line}{" "}
            </span>
          ))}
        </p>
      }
    >
      <h1 className="sr-only">{`Wild Labs: ${HEADLINE}`}</h1>
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
