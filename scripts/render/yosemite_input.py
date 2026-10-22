"""Prepare the Yosemite world input from IMG_9486 (partial ~2.6:1 phone panorama).

  python3 scripts/render/yosemite_input.py tiles     # cut cleanup tiles + haze reference
  (clean each tile with nano-banana.mts into tiles/<name>.clean.png)
  python3 scripts/render/yosemite_input.py compose   # paste back, trim borders, haze, export

Nano Banana only ever sees small tiles; cleaned pixels are pasted back through feathered masks
that cover just the edits, so El Capitan and the rest of the frame keep their original pixels.
Needs Pillow (system Python); not a project dependency.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageStat

ASSETS = Path.home() / "build/wildlabs-assets/inputs/yosemite"
TILES = ASSETS / "tiles"
SOURCE = ASSETS / "IMG_9486.jpg"
HAZE_REF = ASSETS / "IMG_3029.jpg"

# Tile boxes in full-resolution source pixels (left, top, right, bottom), with the
# regions inside each tile that are allowed to change.
TILE_BOXES = {
    # People lying in the grass, water bottle, marker post, cars, RVs and far figures on the left.
    "people_cars": {
        "box": (0, 1640, 2880, 3790),
        "edits": [(0, 2060, 2880, 2330), (690, 2690, 1910, 3280), (450, 2900, 600, 3110), (210, 2420, 300, 2540)],
    },
    # Parked cars and the orange construction barrier further along the road.
    "road_right": {
        "box": (2700, 1880, 4300, 2566),
        "edits": [(2700, 2215, 3950, 2345)],
    },
    # Sun starburst: paste back through a round mask so the ridge below stays original.
    "sun": {"box": (5100, 0, 6700, 1600), "circle": ((5900, 731), 520, 720)},
}

# Stitching artifacts: black wedge and seam along the top right, a thin black sliver on the left.
TRIM = (8, 260, 0, 0)  # left, top, right, bottom

# Haze toward IMG_3029: blend toward its pale sky colour, strongest in the sky, light on the ground.
HAZE_COLOR = (160, 188, 225)
HAZE_STOPS = [(0.0, 0.30), (0.30, 0.24), (0.55, 0.16), (0.65, 0.08), (1.0, 0.03)]  # (y fraction, weight)
SATURATION = 0.9


def cut_tiles() -> None:
    TILES.mkdir(parents=True, exist_ok=True)
    src = Image.open(SOURCE).convert("RGB")
    for name, spec in TILE_BOXES.items():
        tile = src.crop(spec["box"])
        tile.save(TILES / f"{name}.png")
        print(name, tile.size)
    ref = ImageOps.exif_transpose(Image.open(HAZE_REF)).convert("RGB")
    ref.thumbnail((1600, 1600))
    ref.save(TILES / "haze_ref_3029.jpg", quality=90)


def feathered_mask(size: tuple[int, int], spec: dict) -> Image.Image:
    left, top = spec["box"][:2]
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    if "circle" in spec:
        (cx, cy), inner, outer = spec["circle"]
        cx, cy = cx - left, cy - top
        steps = 40
        for i in range(steps, -1, -1):
            r = inner + (outer - inner) * i / steps
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=round(255 * (1 - i / steps)))
        return mask.filter(ImageFilter.GaussianBlur(8))
    for l, t, r, b in spec["edits"]:
        draw.rectangle((l - left, t - top, r - left, b - top), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(24))


def haze_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    column = Image.new("L", (1, h))
    for y in range(h):
        f = y / (h - 1)
        for (f0, w0), (f1, w1) in zip(HAZE_STOPS, HAZE_STOPS[1:]):
            if f0 <= f <= f1:
                column.putpixel((0, y), round(255 * (w0 + (w1 - w0) * (f - f0) / (f1 - f0))))
                break
    return column.resize((w, h))


def match_colour(clean: Image.Image, original: Image.Image, mask: Image.Image) -> Image.Image:
    """Nano Banana drifts warmer and brighter; scale each channel so the untouched area matches the original."""
    keep = ImageOps.invert(mask).point(lambda v: 255 if v > 250 else 0)
    gains = [
        ImageStat.Stat(o, keep).mean[0] / max(1.0, ImageStat.Stat(c, keep).mean[0])
        for o, c in zip(original.split(), clean.split())
    ]
    return Image.merge("RGB", [band.point(lambda v, g=g: min(255, round(v * g))) for band, g in zip(clean.split(), gains)])


def compose() -> None:
    out = Image.open(SOURCE).convert("RGB")
    for name, spec in TILE_BOXES.items():
        box = spec["box"]
        size = (box[2] - box[0], box[3] - box[1])
        mask = feathered_mask(size, spec)
        clean = Image.open(TILES / f"{name}.clean.png").convert("RGB").resize(size, Image.LANCZOS)
        out.paste(match_colour(clean, out.crop(box), mask), box[:2], mask)

    l, t, r, b = TRIM
    out = out.crop((l, t, out.width - r, out.height - b))
    out = Image.composite(Image.new("RGB", out.size, HAZE_COLOR), out, haze_mask(out.size))
    out = ImageEnhance.Color(out).enhance(SATURATION)

    final = ASSETS / "yosemite_input.jpg"
    out.save(final, quality=90)
    preview = out.copy()
    preview.thumbnail((2400, 2400))
    preview.save(ASSETS / "yosemite_input_preview.jpg", quality=85)
    print(final, out.size, f"{final.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    {"tiles": cut_tiles, "compose": compose}[sys.argv[1]]()
