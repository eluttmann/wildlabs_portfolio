import { Fragment } from "react";
import { Media } from "@/components/gallery/Media";
import type { CaseStudyBlock, Figure, ListItem, Rich } from "@/content/case-study";

/** Reading column for text, and the wider band media breaks out into. */
const column = "w-[87vw] max-w-measure";
const band = "w-[87vw] max-w-media";
const body = "text-body-sm text-ink-soft wide:text-body";
const heading = "mb-4 text-heading font-bold text-ink";
const caption = "mt-3 text-caption-sm text-ink-muted wide:text-caption";

export function CaseStudyBlockView({ block }: { block: CaseStudyBlock }) {
  switch (block.kind) {
    case "text":
      return (
        <section className={column}>
          {block.heading && <h2 className={heading}>{block.heading}</h2>}
          <div className="space-y-5">
            {block.paragraphs.map((p, i) => (
              <p key={i} className={body}>
                <RichText value={p} />
              </p>
            ))}
          </div>
        </section>
      );
    case "list":
      return (
        <section className={column}>
          {block.heading && <h2 className={heading}>{block.heading}</h2>}
          <List items={block.items} ordered={block.ordered} />
        </section>
      );
    case "points":
      return (
        <section className={column}>
          {block.heading && <h2 className={heading}>{block.heading}</h2>}
          <div className="space-y-8">
            {block.points.map((point) => (
              <div key={point.title}>
                <h3 className="mb-2 text-body-sm font-bold text-ink wide:text-body">{point.title}</h3>
                {point.items.length === 1 && !point.ordered ? (
                  <p className={body}>
                    <RichText value={point.items[0]} />
                  </p>
                ) : (
                  <List items={point.items} ordered={point.ordered} />
                )}
              </div>
            ))}
          </div>
        </section>
      );
    case "quotes":
      return (
        <section className={column}>
          {block.heading && <h2 className={heading}>{block.heading}</h2>}
          <div className="space-y-10">
            {block.quotes.map((quote) => (
              <figure key={quote.by}>
                <blockquote className="text-lede-sm font-medium text-ink wide:text-lede">“{quote.text}”</blockquote>
                <figcaption className={caption}>{quote.by}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    case "figure":
      return block.width === "measure" ? (
        <FigureView figure={block.figure} className={`${column} flex flex-col items-center`} capped />
      ) : (
        <FigureView figure={block.figure} className={band} />
      );
    case "figures": {
      const odd = block.figures.length % 2 === 1;
      return (
        <div className={`${band} grid gap-x-8 gap-y-12 tablet:grid-cols-2`}>
          {block.figures.map((figure, i) => (
            <FigureView
              key={figure.media.src}
              figure={figure}
              half
              // An odd last figure sits centred under the pair, as on the old site.
              className={odd && i === block.figures.length - 1 ? "tablet:col-span-2 tablet:mx-auto tablet:w-[calc(50%-1rem)]" : ""}
            />
          ))}
        </div>
      );
    }
    case "chapter":
      return (
        <div className={`${band} border-t border-line pt-16 wide:pt-24`}>
          <h2 className="text-display-sm font-bold wide:text-display">{block.title}</h2>
        </div>
      );
  }
}

function FigureView({
  figure,
  className,
  capped = false,
  half = false,
}: {
  figure: Figure;
  className?: string;
  capped?: boolean;
  half?: boolean;
}) {
  const sizes = capped
    ? `${figure.media.width}px`
    : half
      ? "(min-width: 1200px) 540px, (min-width: 810px) 44vw, 87vw"
      : "(min-width: 1200px) 1080px, 87vw";
  return (
    <figure className={className}>
      <Media media={figure.media} capped={capped} sizes={sizes} />
      {figure.caption && <figcaption className={caption}>{figure.caption}</figcaption>}
    </figure>
  );
}

function List({ items, ordered = false }: { items: ListItem[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} space-y-3 pl-6 marker:text-ink-muted ${body}`}>
      {items.map((item, i) =>
        typeof item === "object" && !Array.isArray(item) ? (
          <li key={i}>
            <RichText value={item.text} />
            <ol className="mt-2 list-[lower-alpha] space-y-1 pl-6">
              {item.items.map((sub, j) => (
                <li key={j}>
                  <RichText value={sub} />
                </li>
              ))}
            </ol>
          </li>
        ) : (
          <li key={i}>
            <RichText value={item} />
          </li>
        ),
      )}
    </Tag>
  );
}

function RichText({ value }: { value: Rich }) {
  if (typeof value === "string") return value;
  return value.map((run, i) => {
    if (typeof run === "string") return <Fragment key={i}>{run}</Fragment>;
    const text = run.strong ? <strong className="font-semibold text-ink">{run.text}</strong> : run.text;
    return run.href ? (
      <a key={i} href={run.href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
        {text}
      </a>
    ) : (
      <Fragment key={i}>{text}</Fragment>
    );
  });
}
