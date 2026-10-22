# Render log

Every World Labs and Nano Banana generation, newest last. Brief: `docs/briefs/rendering.md`.
Big files live in `~/build/wildlabs-assets/` (inputs, worlds, stills), never in git.

## Yosemite (session 1, Oct 21 2026)

### Input decision: single image, not multi-image or a 2:1 panorama

Source: `IMG_9486.HEIC`, 9934×3790 (about 2.6:1), roughly 170–180° wide and 65° tall. Not a 360.

| Option | World Labs credits | Verdict |
|---|---|---|
| **Single image** (`is_pano: false`); Marble generates the rest of the sphere | 80 pano + 1,500 world = **1,580** | **Chosen** |
| Multi-image (panorama plus IMG_3023/3024/3029 with directions) | 100 + 1,500 = 1,600 | All three extra photos face the same ridge (Cathedral Rocks and Spires) as the panorama's right half, under heavier haze. Direction mode wants non-overlapping views, and each photo has people to remove. Kept as the second attempt if the Spires side is weak. |
| Extend to a 2:1 panorama with Nano Banana, then `is_pano: true` | 0 + 1,500 = 1,500, plus 3–4 images | Saves 80 credits (6¢), but Nano Banana would invent about 80% of the sphere without understanding the 360° (equirectangular) format, so the sky overhead, the ground underfoot and the wraparound seam would all suffer. World Labs also notes phone panoramas often fail its pano check for lack of top-to-bottom coverage. |

Problems found in the source beyond the people: a lens starburst around the sun, a black stitching wedge
and seam along the top right, a thin black sliver on the left edge, cars, vans and RVs (plus an orange construction
barrier) along the road at the tree line, and a crisper, bluer sky than the hazy IMG_3029. Eric's calls (Oct 21):
soften the sun, add haze, remove the cars.

### Input pipeline (`scripts/render/yosemite_input.py`)

1. HEIC → JPEG with `sips` into `~/build/wildlabs-assets/inputs/yosemite/`. IMG_3023/3024/3029 carry EXIF
   rotation (orientation 6); apply it before sampling or sending them anywhere.
2. Cut three tiles from the full-resolution panorama and clean each with Nano Banana 2:
   `people_cars` (4:3, 4K), `road_right` (21:9, 2K), `sun` (1:1, 2K).
3. Paste each cleaned tile back through a feathered mask that covers only the edit, so El Capitan and the rest of
   the frame keep their original pixels.
4. Trim the top 260 px (wedge and seam) and the left 8 px.
5. Haze: blend toward IMG_3029's pale sky colour `(160, 188, 225)`. The blend is 30% at the top of the frame, 24%
   over the walls, 16% at the tree line and 3% in the foreground, with saturation at 90%.

### Generations

| Date | Tool · model | Input | Prompt | Cost | Time | Output | Verdict |
|---|---|---|---|---|---|---|---|
| Oct 21 | AI Gateway · `google/gemini-3.1-flash-image` | `tiles/people_cars.png` | Remove people, bottle, frisbee, marker post, cars, RVs; fill with meadow and tree line | None (failed) | — | — | **Blocked:** Gateway returned 403 `customer_verification_required` ("requires a valid credit card on file … to unlock your free credits"). Needs a card on the Vercel team. |
| Oct 21 | AI Gateway · `google/gemini-3.1-flash-image` | `tiles/people_cars.png` | Same | None (failed) | — | — | Card added; free credit active. **Blocked:** 403 `RestrictedModelsError`, "Free tier users do not have access to this model." |
| Oct 21 | AI Gateway · `google/gemini-2.5-flash-image` | `tiles/sun.png` | Soften starburst into a diffuse hazy sun | None (failed) | — | — | Same 403: not on the free tier. |
| Oct 21 | AI Gateway · `google/gemini-3.1-flash-lite-image` | `tiles/sun.png` | Same | None (failed) | — | — | Same 403: no Nano Banana model is on the free tier. |
