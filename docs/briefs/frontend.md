# Front-end brief: the portfolio website

Read with `CLAUDE.md` and `docs/PLAN.md` (sections 1–4, 11). This brief is the starting context for the
design-engineering session that builds the site itself: the 3D home world, orbs, camera, ask bar, 2D mode
and polish. Renderings (World Labs worlds, generated stills) are a separate session; see
`docs/briefs/rendering.md`.

## 1. The product in one paragraph

An AI-native portfolio for Eric Luttmann (replacing ericluttmann.com and wildeylabs.com). The default
experience is a 3D place, not pages: visitors arrive in a landscape (San Francisco by default; Yosemite,
Venice Beach and Rio's Arpoador Beach selectable) where nine projects float as glass "droplet" orbs, each an
architectural viewpoint. Information is organized by **Powers of Ten** (room → building → home → planet →
minds → audience) and three regions: **Buildings**, **Applications**, **Infra**. A generative "Ask me anything"
input directs the camera and composes UI. A 2D "museum gallery" scroll shows the same content.

## 2. What exists today (main)

| Path | What it is |
|---|---|
| `src/app/page.tsx` → `src/components/lab/LabShell.tsx` | The **Structure Lab**: UI shell (brand, region legend, layout switcher, ask bar, project panel) |
| `src/components/lab/Scene.tsx` | R3F canvas: procedural studio lighting (drei `Environment` + `Lightformer`, no HDR fetch), camera-relative fog, aspect-aware `CameraControls` rig, contact shadows |
| `src/components/lab/Orb.tsx` | Glass droplet: `meshPhysicalMaterial` transmission (ior 1.33), Kelly-colour core, drei `Html` label, damped motion and bob |
| `src/components/lab/Guides.tsx` | Rings, axes, strands and labels per layout. All six sets stay mounted and fade: **unmounting drei `<Html>` mid-render throws under React 19** |
| `src/lab/layouts.ts` | Six layouts as pure functions (content → positions, sizes, camera, guides): Powers of Ten, Thesis field, Convergence braid, Globe, Orbital roles, Semantic field |
| `src/lab/match.ts` | Local keyword matching for the ask bar (placeholder until the AI director) |
| `src/content/projects.ts` | **Single content source** for 2D, 3D and chat. Placeholder locations are flagged `confirmed: false`; order in time is approximate |
| `src/design/tokens.ts` + `src/app/globals.css` | Design tokens, mirrored for three.js and CSS. Change both together |

Live: https://wildlabs-portfolio.vercel.app (production from `main`; every branch gets a preview URL).

**Known issues:** on phones, Powers of Ten orbs read small and some layouts crop (needs portrait-aware
cameras or layout variants); desktop Powers of Ten labels crowd the inner rings.

## 3. Design direction

- **Ellsworth Kelly (SFMOMA show) and Virgil Abloh:** a minimal gallery frame around rich content. The
  richness lives inside orbs and project rooms, like a museum.
- **Palette:** gallery white `#F3F3F1`, ink `#111111`, one Kelly colour per region: red (Buildings),
  yellow (Applications), blue (Infra). Never hardcode hex in components; use tokens, and add a token when
  one is missing.
- **Type:** Helvetica Neue stack only (`"Helvetica Neue", Helvetica, Arial, sans-serif`). A web licence for
  non-Apple devices is an open question; don't add other fonts.
- **Abloh devices, sparingly:** quotation-mark labels (`"STRUCTURE LAB"`), industrial captions. One device,
  used consistently.
- **Feel:** fluid, floaty, minimal; game-quality motion (easing, slight overshoot and settle on camera
  arrivals, press feedback on orbs). Respect `prefers-reduced-motion`.
- **Global UI rules:** never use left-edge coloured border accents on cards or highlights (use soft
  background washes); never render `+`, `−` or `≈` on figures in UI copy (say it in words).

## 4. Scope for this session, in order

1. **M1 finish:** portrait-aware cameras or layout variants so all six layouts work at 390×844 without
   changing desktop; calmer desktop labels (labels on hover plus ring names, or similar).
2. **M1 decision prep:** draft `docs/decisions/001-structure.md` comparing the six layouts against
   legibility, wayfinding, fit with a landscape world, phone quality and how well each shows the thesis.
   Recommend a home world plus lenses, and leave the final choice clearly marked for Eric.
3. **M2 foundations (after Eric picks):** promote the chosen structure from "lab" to the real home
   experience: camera director with viewpoint rails and interruptible transitions, orb hover and press
   feel, the world dropdown UI (San Francisco · Yosemite · Venice · Rio) with a placeholder environment
   until the rendering session delivers splats, and the 2D ↔ 3D toggle with the 2D gallery reading the
   same content.
4. **Ask bar v1 (M2):** `/api/chat` with the AI SDK streaming tool calls (`focusProject`, `setLens`,
   `flyTo`, `showPanel`), grounded only in `src/content/projects.ts`. Put model IDs in one file,
   `src/lib/ai/models.ts`.

Splat worlds plug in later through the rendering session's `src/components/spikes/SplatWorldScene.tsx`;
don't build your own splat loader.

## 5. AI Gateway facts that affect the ask bar

- All AI calls go through Vercel AI Gateway with plain `provider/model` strings. Don't add provider packages.
- Local auth is `VERCEL_OIDC_TOKEN` in `.env.local` (refresh with `vercel link`, about every 12 hours).
  Deployments authenticate automatically.
- **The free tier only covers a subset of models.** The rendering session found every Nano Banana model
  returns 403 "Free tier users do not have access to this model", and the free credit needed a card on file.
  Check the chat model is on the free list (https://vercel.com/ai-gateway/models?freeTier=true) or ask Eric
  before relying on a paid one. Budget cap: $15 per month on the project.
- Read the version-matched AI SDK docs in `node_modules/ai/docs/` before writing `useChat` or tool code;
  this is AI SDK 7 and Next.js 16, which differ from older patterns.

## 6. Performance and quality bar

- First meaningful 3D frame under 3 s on a recent iPhone; 60 fps on an M-series laptop; at least 45 fps on
  iPhone 15 or newer. Cap device pixel ratio; plan quality tiers for phones.
- Keyboard paths for every action, visible focus, reduced motion, and screen-reader parity through 2D mode.
- Verify in a real browser at 1440×900 and 390×844 with no console errors before every PR.

## 7. Working rules

- **Owned paths:** `src/app/` (except `src/app/spikes/`), `src/components/` (except `src/components/spikes/`),
  `src/lab/`, `src/design/`, `src/lib/ai/`, `src/content/` (content edits only with Eric's input),
  `docs/decisions/`, `docs/briefs/frontend.md`.
- **Not yours:** `scripts/render/`, `src/app/spikes/`, `src/components/spikes/`, `docs/renders/`,
  `public/renders/` (rendering session); `docs/PLAN.md` (updated after merges).
- Ask before adding dependencies (candidates later: Theatre.js for authored camera shots, Rapier for walk
  mode, `leva` for live tuning).
- `pnpm check` before every PR; small PRs into `main`, one per step in section 4.
