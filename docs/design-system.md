# Design system: the 2D world

The 2D gallery (the home page, `/`) and the project pages (`/ombi`, `/autoprospector`, `/dbc`, `/vr`) share one
system, taken from the Framer home page: white walls, black type, the work does the talking. The 3D
world (`/?view=3d`) keeps its own gallery-white palette and Kelly region colours.

Tokens live in `src/app/globals.css`. Colours are mirrored in `src/design/tokens.ts`; the type scale,
widths and breakpoints are DOM-only.

## Principles

1. **Exhibits fill the screen; reading pages start reading.** Each gallery exhibit fills the viewport. On a
   project page the story begins on the first screen: slim nav, left-aligned title block, and the
   header takes no more than about a third of the viewport (first paragraph around 300px down on a
   900px-tall screen, as on the old 2D site). Never give a reading page a full-height hero.
2. **Type and space make the hierarchy.** No cards, shadows, borders or badges. A hairline (`border-line`)
   only marks a new chapter or the end of a page.
3. **The object is the hero.** Media is larger than the text next to it and breaks out of the reading column.
4. **Quiet colour.** Black, two greys, white. The one accent is link blue, and only on inline links.
5. **Say it in words.** No `+`, `−` or `≈` on figures ("more than 250 interviews"), and spell out domain
   acronyms on first use.
6. **No eyebrows.** Lead with the headline. Labels on links and figures ("Next project", captions) are fine.

## Colour

| Token | Value | Use |
|---|---|---|
| `paper` | `#ffffff` | Page background |
| `ink` | `#111111` | Titles, linked titles, emphasis |
| `ink-soft` | `#333333` | Body copy, descriptions |
| `ink-muted` | `#86868b` | Credits, roles, captions, list markers |
| `ink-2` | `#5b5d60` | Hover state on linked titles |
| `line` | `#d3d4d2` | Hairlines |
| `link` | `#0099ff` | Inline links in copy |

## Type

Helvetica Neue stack only. Each role has a size below `wide` (`-sm`) and one from `wide` up.

| Token | Size / line | Weight | Role |
|---|---|---|---|
| `text-display` | 48 / 52 | Bold | Exhibit titles, chapter titles, project page titles (`tablet` up) |
| `text-display-sm` | 36 / 40 | Bold | The same below `wide` |
| `text-heading` | 28 / 34 | Bold | Section headings on project pages |
| `text-lede` / `-sm` | 24 / 30, 20 / 26 | Regular, medium for quotes | Taglines, exhibit descriptions, pull quotes |
| `text-body` / `-sm` | 19 / 30, 17 / 27 | Regular | Paragraphs and lists |
| `text-caption` / `-sm` | 16 / 20, 14 / 18 | Regular | Credits, roles, captions |

The gallery hero headline (40px, bold, all caps, 0.02em tracking) and intro (48px, medium) are one-offs
kept from Framer.

## Layout

| Token | Value | Use |
|---|---|---|
| `max-w-measure` | 680px | Reading column for text (about 70 characters) |
| `max-w-media` | 1080px | Media, figure grids, chapter rules, page footer |
| `tablet:` | 810px | Larger type steps, nav size |
| `wide:` | 1200px | Two-column exhibits, desktop type scale |

Both widths sit inside `w-[87vw]`, so phones keep a 6.5% margin each side. Project-page sections are
spaced `gap-16` (64px), `gap-24` (96px) from `wide` up.

## Components

| Component | File | Role |
|---|---|---|
| `GalleryNav` | `src/components/gallery/GalleryNav.tsx` | Logo to the 3D world, ABOUT. Full height on `/gallery`; `compact` (slim bar) on project pages |
| `GalleryHero` | `src/components/gallery/GalleryHero.tsx` | Gallery first screen |
| `GalleryExhibit` | `src/components/gallery/GalleryExhibit.tsx` | One project per screen; links to its page or outside site |
| `Media` | `src/components/gallery/Media.tsx` | Image or silent looping video at the media's aspect ratio |
| `CaseStudyPage` | `src/components/case-study/CaseStudyPage.tsx` | Compact nav, left-aligned title block, blocks, next project |
| `CaseStudyBlockView` | `src/components/case-study/CaseStudyBlocks.tsx` | Renders text, list, points, quotes, figure(s), chapter |

## Adding a project page

1. Write `src/content/case-studies/<project>.ts` as a `CaseStudy` (types in `src/content/case-study.ts`).
2. Attach it to the project in `src/content/projects.ts` as `caseStudy`.
3. Add `src/app/(2d)/<path>/page.tsx` (copy an existing one). The gallery exhibit links there automatically.
4. Put media in `public/work/<path>/`: WebP at up to 2× display width, MP4 muted with `+faststart`.
