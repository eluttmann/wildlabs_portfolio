# Rendering track status

Where the rendering work stands, for whoever picks it up next. Per-generation detail (prompts, costs, verdicts)
is in `LOG.md`; the brief is `docs/briefs/rendering.md`.

**Last updated:** Oct 25 2026 · **Branch:** `spike/marble-yosemite` · **PR:** #3 (draft, CI green)
· **Preview:** https://wildlabs-portfolio-9d1p8l56o-luttmann.vercel.app/spikes/yosemite (Vercel sign-in)

## Where things stand

| Item | State |
|---|---|
| Yosemite input (IMG_9486 cleaned) | Done: people, cars, RVs, barrier and the sun starburst removed; haze matched to IMG_3029 |
| Yosemite world, draft 1 (`marble-1.1`) | Done but **not faithful**: Marble shrank the wide photo into the front view, duplicated El Capitan and left a floating sky artifact. Meadow, trees and haze are good. |
| `/spikes/yosemite` | Works in dev and production: Spark, real-world scale, three glass orbs reflecting a splat-rendered environment map |
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

## Open items (need Eric)

1. **Yosemite draft 2, 1,600 credits (needs approval).** Multi-image with set directions: split the cleaned
   panorama into three non-overlapping crops at azimuths −55°, 0° and 55°.
2. **Photos for the other worlds.** Not phone panoramas: 4–8 ordinary overlapping photos from one spot, turning
   45–90° between shots, same orientation and zoom, no people.
3. **Merge PR #3**, then update `PLAN.md` (progress log, the billing decision).

## How to resume

```bash
cd ~/build/wildlabs_portfolio-yosemite        # worktree for this branch
cp ../wildlabs_portfolio/.env.local .           # if missing (gitignored)
node --env-file=.env.local scripts/render/worldlabs.mts credits
pnpm dev                                        # then open /spikes/yosemite
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
