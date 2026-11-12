import type { Metadata } from "next";
import Image from "next/image";
import { GalleryNav } from "@/components/gallery/GalleryNav";
import { about } from "@/content/about";

export const metadata: Metadata = {
  title: "Wild Labs: About",
  description: `${about.name}: ${about.intro}`,
};

/** Eric's bio, moved here from the Framer site: the portrait beside the story, in the gallery's slim frame. */
export default function AboutPage() {
  return (
    <>
      <GalleryNav compact />
      <main className="mx-auto grid w-[87vw] max-w-media gap-10 pt-8 pb-24 tablet:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] tablet:gap-16 tablet:pt-12 wide:pb-32">
        <Image
          src={about.portrait.src}
          alt={about.portrait.alt}
          width={about.portrait.width}
          height={about.portrait.height}
          sizes="(min-width: 810px) 40vw, 87vw"
          preload
          className="w-full rounded-[20px] object-cover"
        />
        <div className="flex flex-col gap-6">
          <h1 className="text-display-sm font-bold tablet:text-display">{about.name}</h1>
          <p className="text-lede-sm text-ink-soft wide:text-lede">{about.intro}</p>
          <p className="text-body-sm text-ink-soft wide:text-body">{about.approach}</p>
          <section aria-labelledby="about-projects" className="flex flex-col gap-3">
            <h2 id="about-projects" className="text-caption font-bold tracking-[0.02em] uppercase">
              {about.projectsLabel}
            </h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm text-ink-soft marker:text-ink-muted wide:text-body">
              {about.projects.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-caption font-bold tracking-[0.02em] uppercase">
            {about.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
