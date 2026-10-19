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
| Hosting | Vercel (preview per branch); Render only if a long-lived GPU proxy is needed | Vercel Functions support streaming and WebSockets |
| Assets | Vercel Blob or Cloudflare R2 behind a CDN | Splat files are large (tens of MB) |

### World models: what each one is for

| Model | Status (Oct 2026) | Role here |
|---|---|---|
| **World Labs Marble** | Exports Gaussian splats (SPZ/PLY) and meshes on paid plans. No confirmed export API, so export may be manual. | **Primary.** Generates every walkable world from Eric's photos. |
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
- [ ] Eric adds API keys to `.env.local` (see `.env.example`)
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
- [ ] Vercel preview per branch, production on `ericluttmann.com`, with `wildeylabs.com` redirected or mirrored
- [ ] API spend caps and alerts at $100 per month total
- [ ] Analytics (Vercel Web Analytics) and an error budget
- [ ] Launch checklist and announcement assets

## 5. Budget ($100 per month)

Hard caps are enforced in code (per-day counters) and in each provider's dashboard.

| Item | Plan | Monthly cap |
|---|---|---|
| Vercel | Pro (needed for commercial use and higher limits) | $20 |
| World Labs Marble | Standard during build (splat export); Pro only if mesh export is needed. Verify current pricing. | $20–35, build months only |
| AI Gateway (chat LLM) | Pay as you go, small model by default | $15 |
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
| World Labs has no export API, so generation is manual | Keep the asset pipeline simple: export once and upload through `wildlabs-mcp` |
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
