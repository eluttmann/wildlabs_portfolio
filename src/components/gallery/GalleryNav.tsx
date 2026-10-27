import Image from "next/image";
import Link from "next/link";

/** The bio still lives on the Framer site until it moves into this repo. */
const ABOUT_URL = "https://www.ericluttmann.com/about";

/**
 * 2D top bar: the Wildey painting returns to the 3D world, ABOUT opens the bio. `compact` is the slim
 * bar for reading pages, so the story starts on the first screen.
 */
export function GalleryNav({ compact = false }: { compact?: boolean }) {
  return (
    <header
      className={`flex items-center justify-between px-6 ${compact ? "py-4" : "h-[15svh] tablet:h-[12svh]"}`}
    >
      <Link href="/" aria-label="Wild Labs, back to the 3D world">
        <Image
          src="/exhibits/wildey.webp"
          alt=""
          width={88}
          height={92}
          sizes={compact ? "44px" : "88px"}
          preload
          className={`rounded-[5px] object-cover ${
            compact ? "h-[46px] w-[44px]" : "h-[55px] w-[52px] tablet:h-[92px] tablet:w-[88px]"
          }`}
        />
      </Link>
      <a
        href={ABOUT_URL}
        className={`font-bold hover:underline ${compact ? "text-caption tracking-[0.02em]" : "text-[20px] leading-[1.6]"}`}
      >
        ABOUT
      </a>
    </header>
  );
}
