import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SplatWorldView } from "@/components/world/SplatWorldView";
import { yosemiteWorlds } from "@/components/world/worlds";

export const metadata: Metadata = {
  title: "Yosemite world spike",
  robots: { index: false },
};

/** `?world=` picks one of the Yosemite worlds to review; the first is the default. */
export default function YosemiteSpike(props: PageProps<"/spikes/yosemite">) {
  // searchParams is request data: read it inside Suspense so the rest of the route can prerender.
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-gallery" />}>
      <YosemiteWorld searchParams={props.searchParams} />
    </Suspense>
  );
}

async function YosemiteWorld({ searchParams }: Pick<PageProps<"/spikes/yosemite">, "searchParams">) {
  const { world: asked } = await searchParams;
  const world = yosemiteWorlds.find((w) => w.id === asked) ?? yosemiteWorlds[0];

  return (
    <SplatWorldView key={world.id} world={world}>
      <nav
        hidden={yosemiteWorlds.length < 2}
        className="absolute top-4 left-4 flex gap-4 text-[11px] uppercase tracking-[0.16em]"
      >
        {yosemiteWorlds.map((w) => (
          <Link
            key={w.id}
            href={`/spikes/yosemite?world=${w.id}`}
            className={w.id === world.id ? "text-ink" : "text-ink-3 hover:text-ink-2"}
          >
            {w.short}
          </Link>
        ))}
      </nav>
    </SplatWorldView>
  );
}
