import type { Metadata } from "next";
import { ExhibitFrame, GalleryAsk } from "@/components/gallery/GalleryAsk";
import { GalleryExhibit } from "@/components/gallery/GalleryExhibit";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { ViewToggle } from "@/components/shell/ViewToggle";
import { GALLERY_ORDER, projectBySlug } from "@/content/projects";

export const metadata: Metadata = {
  title: "Wild Labs",
  description: "Eric Luttmann's work as a 2D gallery: 3D and AI products that open access to knowledge and creation.",
};

/**
 * The home page in 2D, the default view: the same projects as the 3D world, hung as a scroll on white
 * walls. `/?view=3d` is rewritten to the 3D world (next.config.ts), so this page stays static.
 */
export default function HomePage() {
  const exhibits = GALLERY_ORDER.flatMap((slug) => {
    const project = projectBySlug[slug];
    if (!project?.exhibit) return [];
    // A project with its own page links there; the rest keep their outside links.
    const href = project.caseStudy ? `/${project.caseStudy.path}` : project.exhibit.href;
    return [{ slug, exhibit: { ...project.exhibit, href } }];
  });

  return (
    <GalleryAsk order={exhibits.map((e) => e.slug)}>
      <GalleryNav>
        <ViewToggle current="2d" />
      </GalleryNav>
      {/* Bottom room so the floating ask bar never sits on the last exhibit. */}
      <main className="pb-28">
        <GalleryHero />
      <section className="flex min-h-svh items-center justify-center pt-[59px] tablet:min-h-[600px] tablet:px-10 tablet:pt-[216px]">
        <h2 className="w-[80%] space-y-[1.1em] text-[28px] leading-[1.1] font-medium tablet:w-[73%] tablet:text-[48px]">
          <span className="block">Eric creates 3D & AI software products that enable access to knowledge & creation.</span>
          <span className="block">He’s worked with startups backed by Sequoia to enterprises such as Nvidia.</span>
          <span className="block">His products have been presented at an Autodesk Keynote and Stanford University.</span>
        </h2>
      </section>
        {exhibits.map(({ slug, exhibit }) => (
          <ExhibitFrame key={slug} slug={slug}>
            <GalleryExhibit exhibit={exhibit} />
          </ExhibitFrame>
        ))}
      </main>
    </GalleryAsk>
  );
}
