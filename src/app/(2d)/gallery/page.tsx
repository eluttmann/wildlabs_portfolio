import type { Metadata } from "next";
import { GalleryExhibit } from "@/components/gallery/GalleryExhibit";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GALLERY_ORDER, projectBySlug } from "@/content/projects";

export const metadata: Metadata = {
  title: "Wild Labs: Gallery",
  description: "Eric Luttmann's work as a 2D gallery: 3D and AI products that open access to knowledge and creation.",
};

/** The 2D gallery: the same projects as the 3D world, hung as a scroll on white walls. */
export default function GalleryPage() {
  const exhibits = GALLERY_ORDER.flatMap((slug) => {
    const project = projectBySlug[slug];
    if (!project?.exhibit) return [];
    // A project with its own page links there; the rest keep their outside links.
    const href = project.caseStudy ? `/${project.caseStudy.path}` : project.exhibit.href;
    return [{ slug, exhibit: { ...project.exhibit, href } }];
  });

  return (
    <main>
      <GalleryHero />
      <section className="flex min-h-svh items-center justify-center pt-[59px] tablet:min-h-[600px] tablet:px-10 tablet:pt-[216px]">
        <h2 className="w-[80%] space-y-[1.1em] text-[28px] leading-[1.1] font-medium tablet:w-[73%] tablet:text-[48px]">
          <span className="block">Eric creates 3D & AI software products that enable access to knowledge & creation.</span>
          <span className="block">He’s worked with startups backed by Sequoia to enterprises such as Nvidia.</span>
          <span className="block">His products have been presented at an Autodesk Keynote and Stanford University.</span>
        </h2>
      </section>
      {exhibits.map(({ slug, exhibit }) => (
        <GalleryExhibit key={slug} exhibit={exhibit} />
      ))}
    </main>
  );
}
