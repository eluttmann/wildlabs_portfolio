import Link from "next/link";
import type { ReactNode } from "react";
import { Media } from "@/components/gallery/Media";
import type { Exhibit } from "@/content/projects";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * One project per screen: wall label on the left and the object on the right from `wide` up,
 * stacked object-first below that (the Framer tablet and phone layouts).
 */
export function GalleryExhibit({ exhibit }: { exhibit: Exhibit }) {
  const { title, href, credits, media } = exhibit;
  return (
    <article className="mx-auto flex min-h-svh w-[87vw] max-w-[640px] flex-col items-center justify-center gap-8 py-16 wide:w-[64vw] wide:max-w-media wide:flex-row wide:gap-0 wide:py-[100px]">
      <div className="order-2 w-[75%] wide:order-1 wide:flex wide:w-1/2 wide:justify-center">
        <div className="flex flex-col items-start gap-[5px] wide:w-[72%] wide:gap-[11px]">
          <h2 className="text-display-sm font-bold text-balance text-ink-soft wide:text-display">
            {href ? (
              <ExhibitLink href={href} className="text-ink hover:text-ink-2 hover:underline">
                {title}
              </ExhibitLink>
            ) : (
              title
            )}
          </h2>
          <p className="text-lede-sm text-ink-soft wide:text-lede">
            <Description exhibit={exhibit} />
          </p>
          <p className="text-caption-sm text-ink-muted wide:text-caption">{credits}</p>
        </div>
      </div>
      <div className="order-1 flex w-full justify-center wide:order-2 wide:w-1/2">
        {href ? (
          // The title already carries this link for keyboards and screen readers.
          <ExhibitLink href={href} tabIndex={-1} aria-hidden className="contents">
            <Media media={media} capped sizes={`(min-width: 1200px) ${media.width}px, 87vw`} />
          </ExhibitLink>
        ) : (
          <Media media={media} capped sizes={`(min-width: 1200px) ${media.width}px, 87vw`} />
        )}
      </div>
    </article>
  );
}

/** Project pages open in place; outside sites open in a new tab. */
function ExhibitLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...external} {...rest}>
      {children}
    </a>
  );
}

function Description({ exhibit: { description, descriptionLink } }: { exhibit: Exhibit }) {
  const at = descriptionLink ? description.indexOf(descriptionLink.text) : -1;
  if (!descriptionLink || at < 0) return description;
  const end = at + descriptionLink.text.length;
  return (
    <>
      {description.slice(0, at)}
      <a href={descriptionLink.href} {...external} className="text-link hover:underline">
        {descriptionLink.text}
      </a>
      {description.slice(end)}
    </>
  );
}
