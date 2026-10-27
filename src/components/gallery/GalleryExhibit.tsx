import Image from "next/image";
import type { Exhibit, ExhibitMedia } from "@/content/projects";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * One project per screen: wall label on the left and the object on the right from 1200px up,
 * stacked object-first below that (the Framer tablet and phone layouts).
 */
export function GalleryExhibit({ exhibit }: { exhibit: Exhibit }) {
  const { title, href, credits, media } = exhibit;
  return (
    <article className="mx-auto flex min-h-svh w-[87vw] max-w-[640px] flex-col items-center justify-center gap-8 py-16 min-[1200px]:w-[64vw] min-[1200px]:max-w-[1080px] min-[1200px]:flex-row min-[1200px]:gap-0 min-[1200px]:py-[100px]">
      <div className="order-2 w-[75%] min-[1200px]:order-1 min-[1200px]:flex min-[1200px]:w-1/2 min-[1200px]:justify-center">
        <div className="flex flex-col items-start gap-[5px] min-[1200px]:w-[72%] min-[1200px]:gap-[11px]">
          <h2 className="text-[36px] leading-[40px] font-bold text-balance text-ink-soft min-[1200px]:text-[48px] min-[1200px]:leading-[52px]">
            {href ? (
              <a href={href} {...external} className="text-ink hover:text-ink-2 hover:underline">
                {title}
              </a>
            ) : (
              title
            )}
          </h2>
          <p className="text-[20px] leading-6 text-ink-soft min-[1200px]:text-[24px] min-[1200px]:leading-7">
            <Description exhibit={exhibit} />
          </p>
          <p className="text-[14px] leading-[18px] text-ink-muted min-[1200px]:text-[16px] min-[1200px]:leading-5">
            {credits}
          </p>
        </div>
      </div>
      <div className="order-1 flex w-full justify-center min-[1200px]:order-2 min-[1200px]:w-1/2">
        {href ? (
          // The title already carries this link for keyboards and screen readers.
          <a href={href} {...external} tabIndex={-1} aria-hidden className="contents">
            <Media media={media} />
          </a>
        ) : (
          <Media media={media} />
        )}
      </div>
    </article>
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

function Media({ media }: { media: ExhibitMedia }) {
  const frame = {
    aspectRatio: `${media.width} / ${media.height}`,
    maxWidth: media.width,
    borderRadius: media.kind === "image" ? media.radius : undefined,
  };
  return (
    <div className="relative w-full overflow-hidden" style={frame}>
      {media.kind === "image" ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={`(min-width: 1200px) ${media.width}px, 87vw`}
          className="object-cover"
        />
      ) : (
        <video
          className="size-full object-cover"
          poster={media.poster}
          aria-label={media.alt}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={media.src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
