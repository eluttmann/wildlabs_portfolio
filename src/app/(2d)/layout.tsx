import type { Viewport } from "next";
import type { ReactNode } from "react";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { color } from "@/design/tokens";

export const viewport: Viewport = {
  themeColor: color.paper,
};

/** The 2D world: the gallery and its project pages, on white walls under one nav. */
export default function TwoDLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-paper text-ink">
      <GalleryNav />
      {children}
    </div>
  );
}
