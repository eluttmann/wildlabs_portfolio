import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** The bio still lives on the Framer site until it moves into this repo. */
const ABOUT_URL = "https://www.ericluttmann.com/about";

/**
 * The site's top bar, shared by 2D and 3D so nothing moves when the view toggles: the Wildey painting goes
 * home, ABOUT opens the bio, and `children` sits centred between them (the view toggle on the home page).
 * `compact` is the slim bar for reading pages, so the story starts on the first screen. `linkHome={false}`
 * makes the painting inert, for the 3D home, which has nowhere else to go. `className` lets 3D float the bar
 * over the world.
 */
export function GalleryNav({
  compact = false,
  linkHome = true,
  className = "",
  children,
}: {
  compact?: boolean;
  linkHome?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const painting = (alt: string, wrapper: string) => (
    <Image
      src="/exhibits/wildey.webp"
      alt={alt}
      width={88}
      height={92}
      sizes={compact ? "44px" : "88px"}
      preload
      className={`rounded-[5px] object-cover ${wrapper} ${
        compact ? "h-[46px] w-[44px]" : "h-[55px] w-[52px] tablet:h-[92px] tablet:w-[88px]"
      }`}
    />
  );

  return (
    <header
      className={`grid grid-cols-[1fr_auto_1fr] items-center px-6 ${compact ? "py-4" : "h-[15svh] tablet:h-[12svh]"} ${className}`}
    >
      {linkHome ? (
        <Link href="/" aria-label="Wild Labs, home" className="justify-self-start">
          {painting("", "")}
        </Link>
      ) : (
        painting("Wild Labs", "justify-self-start")
      )}
      <div>{children}</div>
      <a
        href={ABOUT_URL}
        className={`justify-self-end font-bold hover:underline ${compact ? "text-caption tracking-[0.02em]" : "text-[20px] leading-[1.6]"}`}
      >
        ABOUT
      </a>
    </header>
  );
}
