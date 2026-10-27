import Image from "next/image";
import type { ExhibitMedia } from "@/content/projects";

/**
 * An image or a silent looping video in a box of the media's aspect ratio. `capped` stops it growing
 * past the media's own width (gallery exhibits); otherwise the layout decides the width.
 */
export function Media({ media, sizes, capped = false }: { media: ExhibitMedia; sizes: string; capped?: boolean }) {
  const frame = {
    aspectRatio: `${media.width} / ${media.height}`,
    maxWidth: capped ? media.width : undefined,
    borderRadius: media.kind === "image" ? media.radius : undefined,
  };
  return (
    <div className="relative w-full overflow-hidden" style={frame}>
      {media.kind === "image" ? (
        <Image src={media.src} alt={media.alt} fill sizes={sizes} className="object-cover" />
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
