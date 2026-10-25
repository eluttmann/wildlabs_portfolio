# Rendering track status

Where the rendering work stands, for whoever picks it up next. Per-generation detail (prompts, costs, verdicts)
is in `LOG.md`; the brief is `docs/briefs/rendering.md`.

**Last updated:** Oct 25 2026 · **On `main`:** PR #3 merged Oct 25 (`efa7cd0`)
· **Preview of the spike:** https://wildlabs-portfolio-d87itk5bk-luttmann.vercel.app/spikes/yosemite (Vercel sign-in;
spikes return 404 on production)

**Role and pipeline:** start rendering sessions with `claude --agent world-renderer` (`.claude/agents/world-renderer.md`).
It holds the staged pipeline, quality bar, integration standards and tool map used below.

## Where things stand

| Item | State |
|---|---|
| Yosemite input (IMG_9486 cleaned) | Done: people, cars, RVs, barrier and the sun starburst removed; haze matched to IMG_3029 |
| Yosemite world, draft 1 (`marble-1.1`) | Done but **not faithful**: Marble shrank the wide photo into the front view, duplicated El Capitan and left a floating sky artifact. Meadow, trees and haze are good. |
| `/spikes/yosemite` | Works locally and on preview deployments: Spark, real-world scale, three glass orbs reflecting a splat-rendered environment map. All `/spikes/*` pages return 404 on production (`src/app/spikes/layout.tsx`). |
| Yosemite stills | Done: `public/renders/yosemite-{hero,spires,meadow}.webp` |
| San Francisco, Venice Beach, Rio | Not started; waiting on Eric's photos |

## Balances (Oct 21, after the batch)

- **World Labs:** 5,420 credits (started at 7,000; draft 1 cost 1,580).
- **AI Gateway:** $55 of paid credit added by Eric; this session used about $0.76 (7 Nano Banana 2 images).

## Decisions made

- **Oct 21, Yosemite input:** single image (`is_pano: false`) rather than multi-image or a Nano Banana–extended 2:1
  panorama. Reasoning is in `LOG.md`.
- **Oct 21, cleanup:** soften the sun, add haze, remove cars (Eric's calls). Nano Banana only edits small tiles
  that are colour-matched and pasted back, so El Capitan keeps its original pixels.
- **Oct 21, Gateway billing:** the free tier includes no Nano Banana model, so Eric bought paid credit. This
  reverses the Oct 20 "stay on free tier" decision; `PLAN.md` §11 needs updating after merge (this track doesn't
  edit `PLAN.md`).
- **Oct 21, splat hosting for previews:** load the World Labs CDN files directly (public, CORS `*`, unsigned).
  Development serves local copies. Moving to Vercel Blob is still the M2 decision.
- **Oct 25, spikes hidden on production:** `/spikes/*` returns 404 when `VERCEL_ENV` is `production`.
- **Oct 25, staged pipeline:** every world goes rules → inputs → 2:1 panorama → 150-credit draft
  (`marble-1.0-draft`) → 1,500-credit final world, with a review between each stage. This replaces one-shot
  generation, which spent 1,580 credits on Yosemite before anything could be reviewed.

## Open items (need Eric)

1. **Yosemite draft 2: fix the panorama, then draft, then final (needs approval; about 1,650 credits plus
   about $0.40).** This replaces the earlier multi-image plan (1,600 credits, with no preview before the spend).
   - Start from draft 1's `worlds/yosemite/pano.jpg` (4608×2304, already a 2:1 panorama).
   - Composite the cleaned photo strip back in at its true width, about 175° of the 360°, on the horizon band.
   - Remove the invented second El Capitan and the floating sky rectangle with Nano Banana tiles (about 3–4 images).
   - Eric reviews the panorama.
   - `marble-1.0-draft` with `is_pano: true` (150 credits), then a review sheet of 8 directions plus overhead.
   - Only then `marble-1.1` with `is_pano: true` (1,500 credits). Multi-image stays the fallback.
2. **Photos for the other worlds.** Not phone panoramas: 4–8 ordinary overlapping photos from one spot, turning
   45–90° between shots, same orientation and zoom, no people. Write each world's one-page rules before shooting.
3. **Update `PLAN.md`** after PR #3 (progress log, the Gateway billing decision). That's for the hub session; this
   track doesn't edit `PLAN.md`.

## Next techniques (from the Oct 25 benchmark)

- **Now:** a review-sheet script (8 directions plus overhead from the viewer position); orb shadows and a key light
  from the panorama's sun direction; load 100K splats first, then upgrade; per-world rules page and landmark
  checklist.
- **Spikes:** real-terrain geometry (U.S. Geological Survey elevation data → depth panorama → `depth_to_rgb`;
  check its cost first); collision mesh for walk mode; authored camera shots with Theatre.js; one tone-mapping
  choice for splats and glass.
- **Later:** Marble Compose for larger areas such as San Francisco (web app, separate credits); web extended reality
  (WebXR) through Spark.

## How to resume

```bash
cd ~/build/wildlabs_portfolio && git pull
git worktree add ../wildlabs_portfolio-<topic> -b <type>/<topic> origin/main
cd ../wildlabs_portfolio-<topic>
cp ../wildlabs_portfolio/.env.local . && pnpm install  # .env.local is gitignored
node --env-file=.env.local scripts/render/worldlabs.mts credits
pnpm dev                                                 # then open /spikes/yosemite
```

- **Big files** are in `~/build/wildlabs-assets/`: `inputs/yosemite/` (photos, tiles, cleaned input),
  `worlds/yosemite/` (`.spz` files, `pano.jpg`, `world.json`), `stills/`.
- **World Labs:** `scripts/render/worldlabs.mts generate … --confirm` spends credits; without `--confirm` it's a
  dry run. `fetch --world <id> --id <world_id>` re-downloads for free.
- **Nano Banana:** `scripts/render/nano-banana.mts --ref <img> --aspect 4:3 --size 2K --out <file> --prompt "…"`.
  Write the command out in full in zsh; a `$VAR` holding a command isn't word-split.
- **Input prep:** `python3 scripts/render/yosemite_input.py tiles`, clean the tiles, then `… compose`.
- **This chat session** ("world renderer", started in `~/build/wildlabs`): `claude attach 302181a2`.
  Start new portfolio sessions with `claude agents --cwd ~/build/wildlabs_portfolio` so they can make worktrees.

## Gotchas learned

- A wide, non-360 image prompt gets fitted into the front ~60° of Marble's panorama; don't send panorama strips
  as single images.
- Apply EXIF rotation before using IMG_3023/3024/3029 (orientation 6).
- Nano Banana edits come back warmer and brighter; colour-match before compositing.
- Spark environment map: wait about 30 frames after `mesh.initialized`, mount the orbs afterwards, and don't set an
  R3F `<color attach="background">`, or the glass turns flat and opaque.
- Headless Chrome `--screenshot` with `--virtual-time-budget` fires before splats load; drive Chrome through the
  DevTools protocol in real time to check the page.
