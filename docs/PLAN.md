# Wild Labs Portfolio: Plan

An AI-native portfolio where the website is a place. Visitors arrive in a 3D landscape
(San Francisco by default, with Yosemite, Venice Beach and Rio's Arpoador Beach as alternates),
where Eric's projects float as glass "droplet" orbs. Each orb is an architectural *viewpoint*. Clicking
one dives through its surface into that project's own 3D scene. A generative chat input directs the
camera and composes the interface. A 2D "museum gallery" mode shows the same content as a scroll.

- **Replaces:** ericluttmann.com and wildeylabs.com
- **Timeline:** about one month (Oct 20 – Nov 17, 2026). Quality and high fidelity come before speed.
- **Running budget:** $100 per month total for every API and hosting cost.
- **Repo:** `github.com/eluttmann/wildlabs_portfolio` (private)
- **Live (prototype):** https://wildlabs-portfolio.vercel.app (Vercel project `luttmann/wildlabs-portfolio`)
- **Status (Oct 20):** M0 foundations mostly done, M1 Structure Lab built and deployed; next up are the world-model spikes and the structure review. See the [progress log](#9-progress-log).

---

## 1. Principles

1. **The world is the interface.** The 3D scene is the default UX, not decoration on top of a page.
   Every piece of information has a place, and you move through information instead of switching pages.
2. **LLM as director, world models as set builders.** The large language model (LLM) decides *what to
   show and where the camera goes* (generative UI through tool calls). World models generate *the
   places*: mostly ahead of time, occasionally live.
3. **Minimal frame, rich content.** Virgil Abloh's restraint and Ellsworth Kelly's flat colour fields
   (the SFMOMA show) set the frame: an off-white gallery, Helvetica Neue, one colour per region. The richness
   lives inside the orbs and project rooms, as in a museum.
4. **Powers of Ten.** Information is organized by scale, from a room to a building, a home, the planet,
   networks of minds and audiences. Zooming out is the navigation.
5. **One content source, two renderings.** 2D and 3D read the same typed content. The 2D version is also
   the accessibility, search-engine and low-power fallback.
6. **Grounded AI.** The chat can only talk about projects that exist in `src/content/projects.ts`.
   It never invents clients, figures or dates.

## 2. Information architecture

Three **regions** (from Eric's sketch), arranged along the **Powers of Ten** scale ladder:

| Region | Projects | Scale |
|---|---|---|
| **Buildings** | Immersive Workspaces · VR Design Reviews · DBC App | Room → Building |
| **Applications** | Pillar · Marble · Ombi · Millennial Entertainment | Home → Planet → Audience |
| **Infra** | LangGraph Studio · AutoProspector | Minds (agents and knowledge) |

The San Francisco outline (from Google Maps or Mapbox data) is the *territory* the home world is
organized on: regions become districts of the city, and orbs sit at viewpoints.

## 3. Architecture

```
┌──────────────────────────── Browser ─────────────────────────────┐
│ Next.js App Router (React 19)                                    │
│  ├─ 3D mode (default): React Three Fiber + drei                  │
│  │    ├─ Spark: Gaussian-splat worlds (World Labs Marble exports)│
│  │    ├─ 3d-tiles-renderer: Google Photorealistic 3D Tiles (SF)  │
│  │    ├─ Orbs: glass droplets with physical transmission         │
│  │    └─ Camera director: viewpoint rails and lens transitions   │
│  ├─ 2D mode: museum-gallery scroll (same content)                │
│  └─ Ask bar: AI SDK useChat → streamed tool calls → UI + camera  │
└──────────────┬──────────────────────────────────┬────────────────┘
               │ /api/chat (streaming)            │ /api/live (WebSocket proxy)
┌──────────────▼─────────────┐      ┌─────────────▼────────────────┐
│ Vercel Functions           │      │ Odyssey live session proxy   │
│ AI Gateway → Gemini/Claude │      │ (opt-in "dream" moments,     │
│ Tools: focusProject,       │      │  hard per-day cap)           │
│ setLens, flyTo, showPanel  │      └──────────────────────────────┘
└──────────────┬─────────────┘
               │ build-time / terminal
┌──────────────▼──────────────────────────────────────────────────┐
│ wildlabs-mcp (local MCP server, terminal-first)                 │
│ generate_world (World Labs) · generate_image (Nano Banana)      │
│ generate_video (Cosmos) · list_assets · upload_asset (Blob/R2)  │
└─────────────────────────────────────────────────────────────────┘
```

### Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Server Components for content, client islands for 3D |
| 3D | three.js, `@react-three/fiber` v9, `@react-three/drei` v10 | The standard declarative web 3D stack |
| Worlds | `@sparkjsdev/spark` (World Labs' own splat renderer) | Recommended by World Labs for Marble exports |
| Real places | `3d-tiles-renderer` + Google Map Tiles API | Photorealistic San Francisco for the aerial fly-in |
| Camera | drei `CameraControls`, then Theatre.js for authored shots | Smooth, interruptible transitions |
| Physics (walk mode) | `@react-three/rapier` | Only if walk mode survives prototyping |
| AI | AI SDK 7 (`ai`) through Vercel AI Gateway | Streaming generative UI with tool calls |
| Styling | Tailwind v4 + CSS tokens (`src/app/globals.css`, `src/design/tokens.ts`) | One token source for DOM and 3D |
| Hosting | Vercel project `luttmann/wildlabs-portfolio`, connected to GitHub (production from `main`, a preview per branch); Render only if a long-lived GPU proxy is needed | Vercel Functions support streaming and WebSockets |
| Assets | Vercel Blob or Cloudflare R2 behind a CDN | Splat files are large (tens of MB) |

### World models: what each one is for

| Model | Status (Oct 2026) | Role here |
|---|---|---|
| **World Labs Marble** | Full **World API** (`api.worldlabs.ai`, header `WLT-Api-Key`): generate worlds from text, images, panoramas or video; poll operations; export PLY splats or meshes; check credits. Spec: [openapi.yaml](https://docs.worldlabs.ai/api/reference/openapi.yaml). Key verified Oct 20; 7,000 API credits on the account. | **Primary.** Generates every walkable world from Eric's photos, scripted from the terminal and `wildlabs-mcp`. |
| **Odyssey-2 Pro / Max** | Public developer API, real-time interactive video at ~720p, ~20 fps | **Opt-in live moment** inside a project ("imagine this live"). Costs per session, so capped. |
| **NVIDIA Cosmos** | Open-weight world foundation models (server GPU) | **Offline content**: generated video for project scenes and transitions. |
| **Google Project Genie** | Research prototype, no developer API | **Watch list.** Use only for reference or capture until an API exists. |
| **NVIDIA Omniverse** | Desktop and cloud-streaming platform | **Out of scope** for the web runtime. Possible authoring tool. |
| **Nano Banana (Gemini image)** | Gemini API | Fills environment and texture gaps, makes stylized stills and images for 2D mode. |
| **Google Photorealistic 3D Tiles** | Map Tiles API | San Francisco aerial establishing shot. Attribution required, no caching or modifying tiles. |

### Performance budget

- First meaningful 3D frame in **under 3 seconds** on a recent iPhone over 5G. 2D content renders immediately.
- **60 fps** on an M-series laptop, **at least 45 fps** on iPhone 15 or newer.
- Splat worlds: about 2M splats on desktop, about 500K on mobile.
- Detect low-power devices and offer 2D first.

## 4. Milestones

Dates assume a start on Mon Oct 20, 2026.

### M0: Foundations and feasibility spike (Oct 20 – 23)
- [x] Repo scaffolded: Next.js 16, R3F, drei, Spark, AI SDK, Tailwind v4, pnpm
- [x] Typed content model for the nine existing projects (`src/content/projects.ts`)
- [x] `/` runs the **Structure Lab**: all six spatial layouts, switchable live
- [x] Toolchain pinned: Node 24 (`.nvmrc` plus enforced `engines`), pnpm 11, Vercel CLI 64.7 (branch `chore/dev-setup`)
- [x] Vercel project created and linked, GitHub connected, `main` deployed to production
- [x] AI Gateway budget: $15 per month on the project
- [ ] API keys in `.env.local` (see `.env.example`):
  - [x] World Labs (verified: read-only list call returns 200, wrong key returns 401)
  - [x] Vercel OIDC token (added by `vercel link`, lets local dev reach AI Gateway; expires after about 12 hours)
  - [x] AI Gateway auth: **decided Oct 20 to use the Vercel OIDC token** for local dev (no key). Create a capped `wildlabs-local` key only if `wildlabs-mcp` or long-running scripts need one.
  - [ ] Gemini (Nano Banana), Google Map Tiles, Odyssey, NVIDIA, Mapbox
- [x] Dev setup PR: `pnpm typecheck` / `pnpm check`, GitHub Actions check on every PR, Claude Code settings, `.mcp.json` (Vercel MCP), unused starter icons removed
- [ ] Spike each world model and record cost, speed and quality in `docs/spikes/`:
  - [ ] Marble world from the Yosemite panorama → SPZ → Spark in R3F
  - [ ] Google 3D Tiles fly-in over San Francisco in R3F
  - [ ] Odyssey live session through a server proxy, with time-to-first-frame and cost per minute
  - [ ] Cosmos: one 5-second project transition clip
  - [ ] Nano Banana: a stylized still for one project
- [ ] `wildlabs-mcp` server with `generate_world`, `generate_image` and `list_assets`
- **Exit:** a scored spike table and a decision on which models make the runtime cut

### M1: Structure exploration (Oct 22 – 28)
Six structures, prototyped in one sandbox with a switcher (`src/lab/layouts.ts`):
1. **Powers of Ten:** scale rings from room to audience, where zooming out is the navigation
2. **Thesis field:** Spatial ↔ AI by Creation ↔ Knowledge
3. **Convergence braid:** a spatial strand and an AI strand over time, fusing at Pillar
4. **Globe:** projects pinned to real places
5. **Orbital roles:** rings by role (product, design, engineering, brand)
6. **Semantic field:** similarity-driven clusters that re-form around a question

- [x] Rough versions of all six with smooth transitions between them
- [x] Screenshot QA on desktop and phone (no page errors); live at https://wildlabs-portfolio.vercel.app
- [ ] Portrait camera for phones (Powers of Ten orbs read small)
- [ ] Each one placed in the San Francisco territory (map outline) to judge how it fits the landscape
- [ ] Review session with Eric and pick a **home world (default)** plus **lenses**
- **Exit:** a written decision in `docs/decisions/001-structure.md`

### M2: Home world (Oct 27 – Nov 4)
- [ ] San Francisco territory: map outline, Photorealistic 3D Tiles fly-in, landing at a viewpoint
- [ ] World dropdown: San Francisco · Yosemite (below El Capitan) · Venice Beach · Rio (Arpoador), each a Marble world
- [ ] Glass droplet orbs: refraction, a live preview of each project's world inside, hover and press feel
- [ ] Camera director: viewpoint rails, Powers-of-Ten zoom, interruptible transitions
- [ ] Ask bar v1: `/api/chat` using AI SDK tools `focusProject`, `setLens`, `flyTo` and `showPanel`, grounded in the content
- [ ] 2D ↔ 3D toggle (state persisted, URL addressable)
- **Exit:** walking the home world end to end on desktop and phone within the performance budget

### M3: Project scenes (Nov 3 – 8)
Three options, prototyped, then pick one:
1. **Museum room:** a white Kelly-style room with the project's media on walls and plinths
2. **Inside the world:** the project's own Marble or Cosmos world, with media as floating panes
3. **Diorama:** a scaled model on a plinth that you orbit, with the story told as camera stops

- [ ] The orb dive transition (through the droplet surface into the scene and back)
- [ ] Odyssey "imagine this live" moment in one project (if the spike passed)
- **Exit:** `docs/decisions/002-project-scene.md` and one project fully built in the chosen pattern

### M4: Port existing content (Nov 5 – 9)
- [ ] All nine projects in the chosen scene pattern
- [ ] 2D museum-gallery scroll built from the same content
- [ ] Content template (`docs/CONTENT.md`) for adding projects

### M5: Eric adds newer projects (Nov 8 – 11)
- [ ] Eric adds projects using the template, with media placed in `public/projects/<slug>/`
- [ ] Generate worlds or stills for each new project through `wildlabs-mcp`

### M6: High-fidelity polish (Nov 10 – 15)
- [ ] Brand system: Helvetica Neue type scale, Kelly colour fields, Abloh-style quoted labels (sparingly)
- [ ] Motion: easing, overshoot and settle, the dive transition, optional ambient sound
- [ ] Accessibility: keyboard paths, reduced motion, screen-reader parity through 2D mode
- [ ] Performance pass on real devices
- [ ] Search and social: Open Graph images per project, server-rendered 2D content

### M7: Deploy and launch (Nov 14 – 17)
- [x] Vercel preview per branch and production deploys from `main` (set up early, Oct 20)
- [ ] Production on `ericluttmann.com`, with `wildeylabs.com` redirected or mirrored
- [ ] API spend caps and alerts at $100 per month total (AI Gateway $15 done; Odyssey, Google and Gemini caps to set)
- [ ] Analytics (Vercel Web Analytics) and an error budget
- [ ] Launch checklist and announcement assets

## 5. Budget ($100 per month)

Hard caps are enforced in code (per-day counters) and in each provider's dashboard.

| Item | Plan | Monthly cap |
|---|---|---|
| Vercel | Hobby today (personal, non-commercial); move to Pro if wildeylabs.com sells services | $0 now, $20 on Pro |
| World Labs (World API credits) | 7,000 credits on the account; check cost per world on the [pricing page](https://docs.worldlabs.ai/api/pricing.md) before generating | $20–35, build months only |
| AI Gateway (chat LLM) | Pay as you go, small model by default. **Budget set: $15 per month on the project.** | $15 |
| Odyssey live sessions | Opt-in only, short sessions, daily cap | $15 |
| Google Map Tiles | Within the free monthly usage where possible | $10 |
| Nano Banana / Cosmos | Build-time generation only | $5–10 |
| Asset CDN (Blob or R2) | Splat storage and delivery | $5 |

After launch, World Labs can be paused, because worlds are exported once and served as static files.

## 6. MCP-first workflow

| Server | Use |
|---|---|
| `wildlabs-mcp` (in this repo, M0) | Generate worlds, images and video from the terminal, and manage assets |
| Figma MCP | Pull frames and tokens, push lab screenshots for review |
| Vercel MCP | Deployments, logs and environment variables |
| Linear MCP | Milestones and issues |
| Playwright / Chrome | Visual QA screenshots per lens and world |

## 7. Risks

| Risk | Mitigation |
|---|---|
| ~~World Labs has no export API, so generation is manual~~ | **Resolved Oct 20:** the World API generates and exports worlds programmatically |
| Running out of World Labs credits mid-build | Check the credits endpoint before each batch; generate drafts with `marble-1.1`, finals with `marble-1.1-plus` |
| Prototype URL is public | Fine for now; don't share widely until the home world exists. Password protection needs Vercel Pro. |
| Live world-model cost or latency | Opt-in only, a daily cap, and a graceful fallback to a pre-rendered clip |
| Phone performance with splats, glass and post-processing | Mobile-tier assets, a capped device pixel ratio, quality tiers, offering 2D first |
| Helvetica Neue web licensing | Licence Helvetica Neue or Neue Haas Grotesk through Monotype, or use the system stack (falls back to Arial) |
| Google Tiles terms (attribution, no caching) | Use only for the live fly-in. Stylize with fog and grading, not by editing the tiles. |
| The chat invents facts | Tool-only answers grounded in typed content, with refusal copy for unknowns |

## 8. Open questions

- **Brand name:** "Wild Labs" or "Wildey Labs"? The domain is `wildeylabs.com`, and the repo and folder say "wildlabs".
- **Project locations** for the Globe lens: only Pillar (LA), Immersive Workspaces (Penn State) and LangGraph Studio
  (San Francisco) are known. The rest are marked as placeholders in the content.
- **Project dates** for the braid and timeline: the current order is approximate.
- **Marble client name** (not stated on the current site).
- Photos for San Francisco, Venice Beach and Rio (coming from Eric).
- **Home world structure:** which of the six layouts becomes the default, and which become lenses (M1 review).

## 9. Progress log

### Oct 20, 2026
- Merged PR #1 (M0 foundations and the M1 Structure Lab) into `main`, deleted the `m0-foundations` branch, and started `chore/dev-setup`.
- Pinned the toolchain: Node 24 and pnpm 11 enforced, `@types/node` 24, and the Vercel CLI updated from 58.4 to 64.7.
- Verified the World Labs key. Found that World Labs has a full World API (generation, export, credits), which reverses the "manual export" risk. 7,000 API credits are available.
- Created the Vercel project `luttmann/wildlabs-portfolio`, linked the local repo, connected GitHub and set a $15-per-month AI Gateway budget.
- Deployed `main` to production at https://wildlabs-portfolio.vercel.app and confirmed it renders, with no page errors.
- Chose the Vercel OIDC token for local AI Gateway auth instead of an API key.
- Opened the dev setup PR: check scripts, CI, Claude Code settings, `.mcp.json`, starter icons removed.
- CI caught a clean-checkout bug on its first run (`LayoutProps` types missing); fixed with `next typegen` before `tsc`. PR #2 green.

### Oct 19, 2026
- Ran the jam and communication pass: two-tier world strategy (pre-generated World Labs worlds as the base, live Odyssey moments as options), Powers of Ten information architecture, and regions Buildings / Applications / Infra.
- Created the private repo, this plan, the typed content model for nine projects, and the Structure Lab with six spatial layouts.
- Published the "calm field" concept mockup (since removed from the gallery).

### Next up
1. Merge the dev setup PR (#2).
2. Add the remaining API keys (Gemini, Google Map Tiles, Odyssey, NVIDIA, Mapbox).
3. M1 review: Eric picks the home world and lenses → `docs/decisions/001-structure.md`.
4. Eric sends the San Francisco, Venice Beach and Rio photos.

## 10. Parallel tracks

Run each track in its own Claude Code session, in its own git worktree and branch, so sessions never edit the same files.

| Track | Branch | Worktree folder | Owns these paths |
|---|---|---|---|
| A. Yosemite world spike | `spike/marble-yosemite` | `~/build/wildlabs_portfolio-yosemite` | `scripts/spikes/`, `src/app/spikes/`, `src/components/spikes/`, `docs/spikes/marble-yosemite.md`, `public/worlds/` |
| B. wildlabs-mcp server | `feat/wildlabs-mcp` | `~/build/wildlabs_portfolio-mcp` | `mcp/`, `src/lib/worldlabs/`, `.mcp.json`, `docs/spikes/wildlabs-mcp.md` |
| C. Phone camera + M1 review prep | `feat/m1-portrait-review` | `~/build/wildlabs_portfolio-m1` | `src/components/lab/`, `src/lab/`, `docs/decisions/001-structure.md` |

**Rules for every track**
- Start from an up-to-date `main` (after PR #2 merges).
- Stay inside your owned paths. If you need to touch another track's paths, stop and say so in the PR.
- **Don't edit `docs/PLAN.md`.** Put findings in your own `docs/` file and the PR description; the plan is updated after merges.
- Ask before adding dependencies or spending credits beyond what the track's prompt allows.
- Run `pnpm check` before opening the PR. Open it as a draft PR into `main`.
