"""Put a partial phone panorama back into a 2:1 (equirectangular) panorama at its true width.

    python3 scripts/render/pano_composite.py <base-pano> <photo> <out> [--hfov 175] [--horizon 2050] \
        [--width 8192] [--yaw 0]

Marble squeezed IMG_9486 (about 175° wide) into the front 60° of draft 1's panorama and invented the rest. This
maps the photo back onto the sphere at full size: a phone panorama is cylindrical (columns are evenly spaced in
angle, rows follow tan(latitude) from the horizon row), so each column keeps its angle and each output row samples
the photo row at that latitude. The base panorama (draft 1's, upscaled) fills everything the photo doesn't cover,
and feathered edges blend the two. `--yaw` turns the photo's centre away from the panorama's centre (degrees, left
is positive). Needs Pillow (system Python); not a project dependency.
"""

import argparse
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

parser = argparse.ArgumentParser()
parser.add_argument("base")
parser.add_argument("photo")
parser.add_argument("out")
parser.add_argument("--hfov", type=float, default=175.0, help="photo's horizontal field of view in degrees")
parser.add_argument("--horizon", type=int, default=2050, help="photo row at eye level (pitch 0)")
parser.add_argument("--width", type=int, default=8192)
parser.add_argument("--yaw", type=float, default=0.0)
parser.add_argument("--feather", type=int, default=160, help="blend width in output pixels at the sides and bottom")
parser.add_argument("--top-feather", type=int, default=24, help="blend width at the top edge, which meets sky")
parser.add_argument("--sky", type=int, default=420, help="rows of the photo's own sky extended above it")
parser.add_argument("--trim-top", type=int, default=40, help="photo rows to drop from the top first")
args = parser.parse_args()

W, H = args.width, args.width // 2
px_per_rad = W / (2 * math.pi)

base = Image.open(args.base).convert("RGB").resize((W, H), Image.LANCZOS)
photo = Image.open(args.photo).convert("RGB")
# IMG_9486 keeps a dark stitching line along its top rows; drop them (the extended sky covers the gap).
photo = photo.crop((0, args.trim_top, photo.width, photo.height))
args.horizon -= args.trim_top
pw, ph = photo.size
hfov = math.radians(args.hfov)
focal = pw / hfov  # cylindrical: photo pixels per radian, horizontally and (via tan) vertically

# Columns: one resize, since a cylindrical panorama already spaces columns evenly in angle.
out_w = round(hfov * px_per_rad)
columns = photo.resize((out_w, ph), Image.LANCZOS)

# Rows: output latitude → photo row through tan(latitude).
lat_top = math.atan(args.horizon / focal)
lat_bottom = -math.atan((ph - args.horizon) / focal)
y0 = round(H / 2 - lat_top * px_per_rad)
y1 = round(H / 2 - lat_bottom * px_per_rad)
warped = Image.new("RGB", (out_w, y1 - y0))
for y in range(y0, y1):
    lat = (H / 2 - y) / px_per_rad
    src = min(ph - 1, max(0, round(args.horizon - focal * math.tan(lat))))
    warped.paste(columns.crop((0, src, out_w, src + 1)), (0, y - y0))

def ramp(length: int, start: int, end: int) -> list[int]:
    """Alpha along one axis: rises over `start` pixels, holds at 255, falls over `end` pixels."""
    return [round(255 * min(1, (i + 1) / max(1, start), (length - i) / max(1, end))) for i in range(length)]


# Feathered mask: the product of a horizontal and a vertical ramp, so the top edge (which meets sky) can blend over
# fewer pixels than the sides and bottom (which meet trees and meadow).
f = args.feather
cols = Image.new("L", (warped.width, 1))
cols.putdata(ramp(warped.width, f, f))
rows = Image.new("L", (1, warped.height))
rows.putdata(ramp(warped.height, args.top_feather, f))
mask = ImageChops.multiply(cols.resize(warped.size), rows.resize(warped.size))

x0 = round(W / 2 - out_w / 2 - math.radians(args.yaw) * px_per_rad)

# Sky above the photo: draft 1 painted blue rectangles there. Extend the photo's own top rows (blurred, so the
# colour is smooth) upward and fade them into the base sky, so the photo's top edge never meets those rectangles.
if args.sky:
    top = warped.crop((0, 4, out_w, 12)).resize((out_w, 1), Image.BOX).filter(ImageFilter.GaussianBlur(40))
    # Reach down under the photo's top blend too, so the photo fades into this sky, not into draft 1's.
    height = args.sky + args.top_feather
    sky = top.resize((out_w, height))
    fade = Image.new("L", (1, height))
    fade.putdata([round(255 * min(1, i / args.sky) ** 0.7) for i in range(height)])
    base.paste(sky, (x0, y0 - args.sky), ImageChops.multiply(cols.resize(sky.size), fade.resize(sky.size)))

base.paste(warped, (x0, y0), mask)
base.save(args.out, quality=95)
print(
    f"{args.out}: {W}×{H}; photo spans {args.hfov:.0f}° × {math.degrees(lat_top - lat_bottom):.0f}° "
    f"(x {x0}–{x0 + out_w}, y {y0}–{y1}), {px_per_rad * math.pi / 180:.1f} px per degree"
)
