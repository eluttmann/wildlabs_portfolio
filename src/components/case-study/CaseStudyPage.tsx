import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyBlockView } from "@/components/case-study/CaseStudyBlocks";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { caseStudyByPath, caseStudyProjects } from "@/content/projects";

export function caseStudyMetadata(path: string): Metadata {
  const project = caseStudyByPath(path);
  return { title: `Wild Labs: ${project.title}`, description: `${project.title}: ${project.caseStudy.tagline}.` };
}

/** A project page: slim nav and title, then the story in a reading column with media breaking out wider. */
export function CaseStudyPage({ path }: { path: string }) {
  const project = caseStudyByPath(path);
  const { caseStudy } = project;
  const next = caseStudyProjects[(caseStudyProjects.indexOf(project) + 1) % caseStudyProjects.length];

  return (
    <>
      <GalleryNav compact />
      <main className="pb-24 wide:pb-32">
        {/* Sits on the reading column's left edge so the story starts on the first screen, as on the old site. */}
        <header className="mx-auto flex w-[87vw] max-w-measure flex-col items-start gap-2 pt-8 pb-12 tablet:pt-12">
          <h1 className="text-display-sm font-bold text-balance tablet:text-display">{project.title}</h1>
          <p className="text-lede-sm text-ink-soft wide:text-lede">{caseStudy.tagline}</p>
          <p className="text-caption-sm text-ink-muted wide:text-caption">{caseStudy.role}</p>
        </header>

        <div className="flex flex-col items-center gap-16 wide:gap-24">
          {caseStudy.blocks.map((block, i) => (
            <CaseStudyBlockView key={i} block={block} />
          ))}
        </div>

        <nav
          aria-label="More work"
          className="mx-auto mt-24 flex w-[87vw] max-w-media flex-col gap-8 border-t border-line pt-16 tablet:flex-row tablet:items-end tablet:justify-between wide:mt-32"
        >
          <Link href={`/${next.caseStudy.path}`} className="group">
            <span className="block text-caption-sm text-ink-muted wide:text-caption">Next project</span>
            <span className="text-display-sm font-bold group-hover:underline wide:text-display">{next.title}</span>
          </Link>
          <Link href="/"className="text-caption font-bold tracking-[0.02em] uppercase hover:underline">
            All work
          </Link>
        </nav>
      </main>
    </>
  );
}
