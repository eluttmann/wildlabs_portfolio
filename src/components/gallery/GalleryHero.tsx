/**
 * First screen of the gallery: the thesis centred, the signature line along the bottom edge. From
 * tablet up the section stops 80px short of the fold so the floating ask bar never covers the signature.
 */
export function GalleryHero() {
  return (
    <section className="relative flex h-[75svh] items-center justify-center px-6 tablet:h-[calc(88svh-80px)]">
      <h1 className="w-[344px] max-w-full text-center text-[40px] leading-[1.2] font-bold tracking-[0.02em] tablet:w-[576px]">
        ENABLE ACCESS TO KNOWLEDGE & CREATION <br />
        VIA SPATIAL AI
      </h1>
      <div className="absolute inset-x-[25px] bottom-4 grid grid-cols-3 items-center text-[25px] font-bold">
        <span lang="ja" className="hidden wide:block">
          ワイルド
        </span>
        <p className="col-start-2 text-center text-[24px] tracking-[0.02em] whitespace-nowrap tablet:text-[31.25px]">
          ERIC LUTTMANN
        </p>
        <span className="hidden justify-self-end wide:block">© 2026</span>
      </div>
    </section>
  );
}
