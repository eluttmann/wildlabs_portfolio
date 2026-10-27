import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyBlockView } from "@/components/case-study/CaseStudyBlocks";
import { caseStudyByPath, caseStudyProjects } from "@/content/projects";

export function caseStudyMetadata(path: string): Metadata {
  const project = caseStudyByPath(path);
  return { title: `Wild Labs: ${project.title}`, description: `${project.title}: ${project.caseStudy.tagline}.` };
}

/** A project page: centred title, then the story in a reading column with media breaking out wider. */
export function CaseStudyPage({ path }: { path: string }) {
  const project = caseStudyByPath(path);
  const { caseStudy } = project;
  const next = caseStudyProjects[(caseStudyProjects.indexOf(project) + 1) % caseStudyProjects.length];

  return (
    <main className="pb-24 wide:pb-32">
      <header className="mx-auto flex min-h-[55svh] w-[87vw] max-w-media flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-display-sm font-bold tracking-[-0.01em] text-balance tablet:text-display wide:text-hero">
          {project.title}
        </h1>
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
        <Link href="/gallery" className="text-caption font-bold tracking-[0.02em] uppercase hover:underline">
          All work
        </Link>
      </nav>
    </main>
  );
}
