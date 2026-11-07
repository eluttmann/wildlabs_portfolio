# Rendering track: status and handoff

The page a new rendering session reads first. It says where the work stands, how we got here, what to do next and
how to pick it up. Every generation's prompts, costs and verdicts are in `LOG.md`.

**Last updated:** Nov 7 2026 · **On `main`:** `6904544` (PRs #11 to #15 merged)
· **Live:** https://wildlabs-portfolio.vercel.app/?view=3d · **Tracker:**
https://claude.ai/artifact/HagmDRP3qLPdJYgAC9DoVR

## Start here

1. Start the session with `claude --agent world-renderer` (`.claude/agents/world-renderer.md`). It holds the role,
   quality bar, staged pipeline, spending rules and integration standards.
2. Read, in order: `CLAUDE.md`, `docs/briefs/rendering.md` (goals, art direction, **spending rules §7**), this page,
   then `LOG.md` sessions 3 to 5 for the detail behind the current world.
3. `docs/PLAN.md` is the whole project's plan (milestones M0 to M4, decisions). The hub session owns it; this track
   doesn't edit it.
4. Never spend World Labs credits on a regeneration, `marble-1.1-plus` or a new world without Eric's OK (brief §7).

## Where things stand

The **3D home is the El Capitan Meadow world**, live at `/?view=3d`. It reads like a photograph standing still on a
16-inch MacBook Pro. The 2D gallery stays the default at `/`.

| Piece | State | Where |
|---|---|---|
| Home world | `yosemite-photo-plus-v2`, World Labs `6a49de28-79ab-48e9-a445-c54bbe9c86f7`, `marble-1.1-plus`, from Eric's photo IMG_9486 placed at its true width in an 8K panorama, near field cleaned | `src/components/world/worlds.ts` (`homeWorld`) |
| Renderer | Spark in React Three Fiber; no tone curve; viewer at Marble's capture height; splats only within 25 m with the 8K panorama drawn behind them; 500K splats first, then full resolution on desktop | `src/components/world/SplatWorldScene.tsx` |
| 3D home page | The world, the three project orbs, and the shared top bar (logo, 2D/3D toggle, ABOUT; PR #15 from the home track) | `src/app/world/page.tsx` (served for `/?view=3d`) |
| Structure Lab | The six M1 layouts, moved off the 3D home on Oct 30 | `/structure` (`src/app/structure/page.tsx`) |
| Workbench | Same world and renderer with review switches; 404 on production | `/spikes/yosemite` |
| 8K backdrop | Public Vercel Blob store `wildlabs-worlds` | URL in `worlds.ts` |
| Splat files (`.spz`) | World Labs CDN on deployments; local copies in development | `~/build/wildlabs-assets/worlds/yosemite-photo-plus-v2/` |
| Older worlds | Draft 1, the Oct 28 drafts, option B, photo 1.1, the uncleaned photo plus: archived, not deleted | `~/build/wildlabs-assets/archive/worlds/`; ids and verdicts in `LOG.md` |
| Stills | Hero, spires, meadow | `public/renders/yosemite-*.webp` |
| San Francisco, Venice Beach, Rio | Not started; waiting on Eric's photos | — |

**Known flaws in the home world:** a grey stone about a metre behind the viewer that reads like foil; one smeary pine
where splats hand off to the backdrop at 25 m (the seam shows if you walk); a softer, speckled ground on phones,
which stay at 500K splats; the orbs still sit where draft 1 put them and read small and low.

## The process (the recipe that works)

Every world goes through these stages, with a review before any spend. Sessions 1 to 4 in `LOG.md` show how each
one was learned.

1. **Rules and capture.** One page per world: standpoint, season, sun direction, landmarks, what must never appear.
   Photos: 4 to 8 ordinary overlapping shots from one spot (or one wide phone panorama), no people.
2. **Clean the inputs.** Nano Banana edits small tiles (people, cars, harsh sun), colour-matched and pasted back so
   the real landmarks keep their pixels (`scripts/render/yosemite_input.py`).
3. **Build an 8K 2:1 panorama yourself.** Don't send a wide photo to Marble as a single image: it squeezes it into
   the front 60° and invents the rest (El Capitan appeared three times). Map the photo onto the sphere at its true
   width (`scripts/render/pano_composite.py`), fill the rest, then fix problems through flat views
   (`scripts/render/pano_faces.py`: `extract` a perspective view, edit it with Nano Banana, `merge` it back with the
   photo protected, `sky` for open sky). **The panorama is where you design:** most flaws in a world are already
   in it.
4. **Generate.** `marble-1.1-plus` with `is_pano: true` from that panorama (3,000 credits, about 8 minutes). A
   150-credit `marble-1.0-draft` can check composition first, but drafts are too soft to judge fidelity.
5. **Integrate.** Add the world to `worlds.ts` (CDN `.spz` URLs, metric scale, ground offset from `world.json`),
   upload the 8K panorama to Blob (`scripts/render/blob-put.mts`) and set it as `backdrop`.
6. **Review the same way every time.** `scripts/render/review-sheet.mts` captures fixed views at 16-inch MacBook
   resolution (1728×1117 at 2×) through the Chrome DevTools protocol; `--look` passes render settings, `--page`
   points at the home. Also look straight up and down (`?pitch=`).
7. **Log it.** A row in `LOG.md` for every call (cost, time, verdict); update this page.

### What made the difference to fidelity

| Problem | Cause | Fix |
|---|---|---|
| Dark, muddy colour | React Three Fiber's default ACES tone curve | No tone mapping |
| Floaters, wavy horizon bands, streaky ground | Viewing from 1.6 m instead of Marble's capture height | View from the capture height |
| Pixelated mountains and sky, "scratchy" trees | Marble paints the distance from a 4,608 px panorama and shrinks any input to that | **Near/far split:** splats within 25 m, the 8K panorama at infinity behind them (biggest single gain) |
| Soft near field, short reach | The draft tier | `marble-1.1-plus` |
| Canopy overhead, dark patch underfoot | Invented by an earlier panorama | Edit the panorama, regenerate |

Spark's anti-alias blur and focal adjustment made no visible difference. Every render setting can be compared from
the URL: `?tone=aces`, `?eye=standing`, `?backdrop=off`, `?cull=`, `?turn=`, `?res=`, `?at=`, `?yaw=`, `?pitch=`.

## Next steps

In order. Items marked **Eric** need his decision or input first.

1. **Arrival view and orbs (Eric picks the view).** Today the visitor faces the photo's centre (the sun, between El
   Capitan and Cathedral Rocks); El Capitan is about 55° to the left. Then place the three orbs at 4 to 6 m on that
   sightline, at a height and size that suit the new scale, with a key light from the sun direction and soft
   shadows. The home track's PR #15 used the branch name `feat/arrival-orb` for its top-bar work, so check with that
   track before touching `src/app/world/page.tsx`.
2. **Near-field polish (free).** Fade out the stone behind the viewer with a Spark `SplatEdit` sphere; soften the
   25 m seam (tune the cull distance and soft edge, or add haze) so the ghost pine goes.
3. **Camera.** The home still orbits around a point 10 m ahead (`CameraControls`, `maxDistance` 14), which can pull
   the viewer out of the sweet spot. Switch to turning in place plus short moves, which is how every splat world
   should be viewed.
4. **Performance and loading.** A desktop visit downloads about 80 MB (two splat files and the backdrop). Measure the
   first frame and the frame rate on a MacBook and an iPhone 15 against the plan's budget (first 3D frame under 3 s,
   60 fps desktop, 45 fps phone). Consider a 4K backdrop for phones. The home track left the loading screen colour
   undecided (light grey against 2D's white).
5. **Hosting (Eric).** Decide whether the `.spz` files move from the World Labs CDN to the Blob store, so the site
   doesn't depend on World Labs' file host. `blob-put.mts` already handles `.spz`.
6. **The other worlds (Eric's photos).** San Francisco, Venice Beach and Rio with the same recipe; the Yosemite bike
   ride as a chain of stops, each a standpoint about 10 to 25 m across, joined by transitions.
7. **Later.** An opt-in live moment (Odyssey, or Decart's Lucy restyling the meadow) in a project scene (PLAN M3); a
   captured-splat comparison (Polycam, Luma, Scaniverse or Postshot from a walking video) against Marble on the
   same place.

## Balances and accounts (Nov 7)

- **World Labs API:** 6,880 credits. $1 buys 1,250 at https://platform.worldlabs.ai/billing. A top-tier world from a
  panorama costs 3,000; `marble-1.1` costs 1,500; a draft 150.
- **Marble web app:** Eric's Standard plan, 20,000 credits a month. A separate balance: it can't pay for API calls,
  but the web app can generate from an uploaded panorama and export splat files.
- **AI Gateway (Nano Banana):** paid credit, about $54 at the last check (Oct 30). About $0.10 per 2K image.
- **Vercel Blob:** store `wildlabs-worlds`, public, connected to the project (`BLOB_READ_WRITE_TOKEN` in the main
  checkout's `.env.local`).

## Decisions made

- **Oct 21:** clean inputs with Nano Banana on small tiles only; soften the sun, add haze, remove cars (Eric).
- **Oct 25:** spikes return 404 on production; every world goes rules → inputs → panorama → draft → final, reviewed
  between stages.
- **Oct 30, fidelity round:** judge fidelity on full-tier worlds, standing still, on a 16-inch MacBook Pro; no tone
  curve; viewer at the capture height; near/far split with an 8K photo backdrop.
- **Oct 30:** Eric chose option A (his photo) at `marble-1.1-plus` as the meadow's base; the near field was cleaned
  and every other option archived.
- **Oct 30:** the meadow is the 3D home; the Structure Lab moves to `/structure` (Eric); the 8K backdrop is hosted on
  Vercel Blob (Eric).

## How to resume

```bash
cd ~/build/wildlabs_portfolio && git pull
# New work goes on a branch in its own worktree (the session's EnterWorktree tool does this).
pnpm install && pnpm dev                     # open /?view=3d (home) and /spikes/yosemite (workbench)
node --env-file=/Users/eric/build/wildlabs_portfolio/.env.local scripts/render/worldlabs.mts credits
```

- **Secrets:** read `.env.local` from the main checkout with `--env-file=<absolute path>`; don't copy it into a
  worktree, and never print it.
- **World Labs:** `scripts/render/worldlabs.mts generate --world <folder> --model marble-1.1-plus --pano --image <8k.jpg>`
  is a dry run until `--confirm`; downloads land in `~/build/wildlabs-assets/worlds/<folder>/`.
- **Nano Banana:** `scripts/render/nano-banana.mts --ref <img> --aspect 16:9 --size 2K --out <file> --prompt "…"`.
- **Panorama work:** `python3 scripts/render/pano_composite.py …` and `python3 scripts/render/pano_faces.py
  extract|merge|sky …` (Pillow only; numpy isn't installed).
- **Review:** `node scripts/render/review-sheet.mts --base http://localhost:3000 --world <id> --tag <name>`
  (`--page "/?view=3d"` for the home; output in `~/build/wildlabs-assets/reviews/<world>/<tag>/`).
- **Reach estimate:** `node scripts/render/splat-reach.mts <world folder>`.
- **Upload to Blob:** `node --env-file=/Users/eric/build/wildlabs_portfolio/.env.local scripts/render/blob-put.mts
  <file> <pathname>`, then put the printed URL in `worlds.ts`.
- **Big files** live in `~/build/wildlabs-assets/` (never in git): `inputs/yosemite/` (photos, tiles,
  `pano/option-a-8k-v2.jpg`, `pano/faces/`), `worlds/` (current), `archive/worlds/` (older), `reviews/`, `stills/`.
  They aren't backed up anywhere else yet.

## Gotchas learned

- **Marble:** shrinks every input panorama to 4,608 px; a wide non-360 image gets squeezed into the front 60°;
  `marble-1.0-draft` returns no metric scale or ground offset; `marble-1.1-plus` reports its final cost only on
  completion (1,500 to 3,000 extra for world size).
- **Spark and three.js:** an equirectangular background starts 90° away from Marble's panorama (`turn` 90); wait about
  30 frames after `mesh.initialized` before rendering the environment map, mount the orbs afterwards, and don't set
  an R3F `<color attach="background">`; React Three Fiber applies ACES tone mapping unless told not to.
- **Viewing:** splat worlds hold up only near the capture point; landmarks sit on a backdrop 50 to 70 m out.
  `CameraControls` clamps tilt, so `?pitch=` review views loosen it.
- **Nano Banana:** edits come back warmer and brighter, and a global colour match overcorrects when the edit removed
  dark objects (use a 50/50 blend); it sometimes reframes a view instead of editing in place; it won't reliably
  remove shadows.
- **Tooling:** headless Chrome `--screenshot` fires before splats load (use the review sheet); zsh doesn't word-split
  a `$VAR` holding a command; a worktree-isolated session refuses some compound shell commands, so keep them plain.
- **Git:** stacked PRs merge into the branch below them, not `main`. Retarget each one to `main` before merging, or
  open one PR from the top branch.
- **Blob CLI:** refuses to choose between an OIDC token and the read-write token; `blob-put.mts` handles that.
