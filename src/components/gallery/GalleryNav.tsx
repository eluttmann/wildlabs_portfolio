import Image from "next/image";
import Link from "next/link";

/** The bio still lives on the Framer site until it moves into this repo. */
const ABOUT_URL = "https://www.ericluttmann.com/about";

/** Gallery top bar: the Wildey painting returns to the 3D world, ABOUT opens the bio. */
export function GalleryNav() {
  return (
    <header className="flex h-[15svh] items-center justify-between px-6 tablet:h-[12svh]">
      <Link href="/" aria-label="Wild Labs, back to the 3D world">
        <Image
          src="/exhibits/wildey.webp"
          alt=""
          width={88}
          height={92}
          sizes="88px"
          preload
          className="h-[55px] w-[52px] rounded-[5px] object-cover tablet:h-[92px] tablet:w-[88px]"
        />
      </Link>
      <a href={ABOUT_URL} className="text-[20px] leading-[1.6] font-bold hover:underline">
        ABOUT
      </a>
    </header>
  );
}
