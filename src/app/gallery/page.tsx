import type { Metadata, Viewport } from "next";
import { GalleryExhibit } from "@/components/gallery/GalleryExhibit";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { GALLERY_ORDER, projectBySlug } from "@/content/projects";
import { color } from "@/design/tokens";

export const metadata: Metadata = {
  title: "Wild Labs: Gallery",
  description: "Eric Luttmann's work as a 2D gallery: 3D and AI products that open access to knowledge and creation.",
};

export const viewport: Viewport = {
  themeColor: color.paper,
};

/** The 2D gallery: the same projects as the 3D world, hung as a scroll on white walls. */
export default function GalleryPage() {
  const exhibits = GALLERY_ORDER.flatMap((slug) => {
    const exhibit = projectBySlug[slug]?.exhibit;
    return exhibit ? [{ slug, exhibit }] : [];
  });

  return (
    <div className="min-h-full bg-paper text-ink">
      <GalleryNav />
      <main>
        <GalleryHero />
        <section className="flex min-h-svh items-center justify-center pt-[59px] min-[810px]:min-h-[600px] min-[810px]:px-10 min-[810px]:pt-[216px]">
          <h2 className="w-[80%] space-y-[1.1em] text-[28px] leading-[1.1] font-medium min-[810px]:w-[73%] min-[810px]:text-[48px]">
            <span className="block">Eric creates 3D & AI software products that enable access to knowledge & creation.</span>
            <span className="block">He’s worked with startups backed by Sequoia to enterprises such as Nvidia.</span>
            <span className="block">His products have been presented at an Autodesk Keynote and Stanford University.</span>
          </h2>
        </section>
        {exhibits.map(({ slug, exhibit }) => (
          <GalleryExhibit key={slug} exhibit={exhibit} />
        ))}
      </main>
    </div>
  );
}
