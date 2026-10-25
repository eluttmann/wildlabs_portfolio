# Rendering brief: World Labs worlds and Gemini (Nano Banana) images

Read this with `docs/PLAN.md` (sections 1–3, 11) and `CLAUDE.md`. This brief is the starting context for
any session focused on generating environments and imagery for the Wild Labs portfolio.

## 1. What we're making

The portfolio is a 3D place: visitors land in a landscape where Eric's nine projects float as glass
"droplet" orbs (architectural viewpoints). The landscape is selectable from a dropdown. Renderings feed
that landscape and the 2D gallery mode.

| Deliverable | Tool | Used in |
|---|---|---|
| **Four walkable worlds** (Gaussian splats): San Francisco (default), Yosemite below El Capitan, Venice Beach, Rio de Janeiro (Arpoador Beach) | World Labs World API (Marble) | M2 home world, rendered with Spark in React Three Fiber |
| **Environment fills and fixes**: extend a photo's sky or ground, clean people out of a frame, make a 2:1 panorama input | Nano Banana via AI Gateway | Inputs to World Labs |
| **Stylized stills**: hero images per world, one still per project, Open Graph images | Nano Banana via AI Gateway | 2D museum-gallery mode, social previews (M4, M6) |
| **Short transition clips** (optional, later) | Veo 3.1 or Kling via AI Gateway | Orb dive transitions (M3) |

**Order of work:** Yosemite first (photos exist), then San Francisco, Venice and Rio once Eric sends photos.

## 2. Art direction

- **Ellsworth Kelly (SFMOMA show) and Virgil Abloh:** a minimal gallery frame around rich content.
- **Landscapes stay quiet:** haze, softened saturation, natural light. Eric's Yosemite photos already have
  the right atmospheric haze; match it. No dramatic colour grading, no fantasy elements.
- **Colour belongs to the orbs:** Kelly red (Buildings), Kelly yellow (Applications), Kelly blue (Infra) on
  gallery white `#F3F3F1`. Worlds must leave room for those colours to read.
- **Typography in any generated image:** none. Text is set in Helvetica Neue by the site, never baked into images.
- **Real places, faithfully:** El Capitan, the Cathedral Spires, Venice Beach and Arpoador should be
  recognizable. Don't invent landmarks.
- **No people** in world inputs or outputs unless Eric asks: people in splat worlds render as smears.

## 3. Photo inventory

Originals live in `~/Downloads` (HEIC). Convert with `sips -s format jpeg <in> --out <out>`.
Keep originals and conversions **outside git** (see section 6).

| File | What it shows | Use |
|---|---|---|
| `IMG_9486.HEIC` | Panorama of the Yosemite Valley meadow: El Capitan on the left, valley, pines; 9934×3790 (about 2.6:1, **not** a full 360). A few people lie in the grass at bottom left. | **Primary Yosemite world input.** Partial panorama: either use it as an image prompt, or extend it to a 2:1 panorama with Nano Banana first. Remove the people first. |
| `IMG_3023.HEIC`, `IMG_3024.HEIC` | Meadow facing the Cathedral Spires, tall pine, heavy haze. One person in mid-distance. | Extra angles for a multi-image prompt; haze reference |
| `IMG_3029.HEIC` | Wide meadow toward the Cathedral Spires, clear foreground, a few small figures | Multi-image prompt; ground-plane reference |
| `IMG_3018.HEIC` | Portrait of a person seated in the meadow | **Don't use as world input.** Lighting and haze reference only. |
| `IMG_3760–3762.heic` | Eric's paper sketches: orbs over a horizon with a world dropdown; "Organize spatially" outline (San Francisco map); orbs ring with "Ask me anything" | Composition reference only |
| *(pending)* | San Francisco, Venice Beach, Rio (Arpoador) photos from Eric | Future worlds |

## 4. World Labs World API

- **Docs:** https://docs.worldlabs.ai/api/index.md · **Spec:** https://docs.worldlabs.ai/api/reference/openapi.yaml ·
  **Pricing:** https://docs.worldlabs.ai/api/pricing.md · **Rendering SPZ:** https://docs.worldlabs.ai/api/rendering-spz.md ·
  **Prompt guides:** image, multi-image, pano and video under https://docs.worldlabs.ai/marble/create/prompt-guides/index.md
- **Base URL:** `https://api.worldlabs.ai` · **Auth header:** `WLT-Api-Key: $WORLD_LABS_API_KEY` (in `.env.local`; never print it)
- **Flow:** `POST /marble/v1/media-assets:prepare_upload` (upload local photos) → `POST /marble/v1/worlds:generate`
  (returns an operation) → poll `GET /marble/v1/operations/{id}` until `done` → `GET /marble/v1/worlds/{id}` or
  `POST /marble/v1/worlds/{id}:export`
- **Free checks:** `GET /marble/v1/credits`, `POST /marble/v1/worlds:list`
- **Models:** `marble-1.1` (drafts) and `marble-1.1-plus` (larger outdoor worlds, more credits)
- **Account:** key verified Oct 20; **7,000 credits** at that time

## 5. Gemini / Nano Banana through AI Gateway (no Gemini key)

- **Decision (Oct 20):** all AI model calls go through Vercel AI Gateway. There is no `GEMINI_API_KEY`.
- **Auth:** the AI SDK reads `VERCEL_OIDC_TOKEN` from `.env.local` automatically. It expires after about
  12 hours; if calls fail with an auth error, run `vercel link` in the repo root to refresh it.
  Standalone Node scripts must load `.env.local` themselves (`node --env-file=.env.local script.ts`).
- **Image models (verify against https://ai-gateway.vercel.sh/v1/models before use):**
  `google/gemini-3.1-flash-image` (Nano Banana 2), `google/gemini-3-pro-image` (Nano Banana Pro),
  `google/gemini-2.5-flash-image` (Nano Banana), `google/gemini-3.1-flash-lite-image` (Nano Banana 2 Lite)
- **How to call:** read the version-matched docs in `node_modules/ai/docs/` for image generation with a
  Gateway `provider/model` string. Don't add `@ai-sdk/google` or other provider packages.
- **Cost:** pay as you go at provider list price; the team is on the free tier (monthly free credit, subset of
  models, lower rate limits). Don't buy credits. Project budget cap: **$15 per month**.

## 6. Files and storage

| What | Where | In git? |
|---|---|---|
| Original photos | `~/Downloads` (leave as is) | No |
| Converted and edited inputs | `~/build/wildlabs-assets/inputs/<world>/` | No |
| World exports (`.spz`, `.ply`, meshes) | `~/build/wildlabs-assets/worlds/<world>/` | No (tens of MB each) |
| Generated stills, full size | `~/build/wildlabs-assets/stills/` | No |
| Web-optimized stills the site uses | `public/renders/<name>.webp` (under 500 KB each) | Yes |
| Scripts | `scripts/render/` | Yes |
| Log of every generation | `docs/renders/LOG.md` | Yes |

Hosting splats for the live site (Vercel Blob or the World Labs asset URL) is decided in the M2 spike;
until then, load them locally.

## 7. Spending rules

- **Check credits before and after** every World Labs batch.
- **World Labs:** one `marble-1.1` draft per world may run without asking. Ask Eric before any
  `marble-1.1-plus` generation, any second attempt at the same world, or any export that costs credits.
- **Nano Banana:** up to 10 images per session without asking; ask before more, and before using
  Nano Banana Pro.
- **Video (Veo, Kling):** ask first, always.
- Record every generation in `docs/renders/LOG.md`: date, tool, model, inputs, prompt, credits or cost,
  time taken, output path, and a one-line verdict.

## 8. Definition of done for the first session

1. Yosemite inputs prepared (people removed, 2:1 panorama if chosen), with the reasoning written down.
2. One Yosemite world generated with `marble-1.1`, exported, and viewable at `/spikes/yosemite` with Spark,
   with three glass orbs placed in the meadow (reuse `src/components/lab/Orb.tsx`).
3. Two or three Nano Banana stills of Yosemite in the art direction above.
4. `docs/renders/LOG.md` filled in, and a short verdict on quality, cost and next steps for the other worlds.
5. `pnpm check` passes; PR into `main`, ready for review (a draft only if something is unfinished or waits on Eric).
