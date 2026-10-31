"""Edit a 2:1 (equirectangular) panorama through flat views, so image models see ordinary perspective pictures.

    python3 scripts/render/pano_faces.py extract <pano> <out.png> --yaw 180 --pitch 5 --hfov 110 --width 1920 --height 1080
    python3 scripts/render/pano_faces.py merge <pano> <edited.png> <out-pano> --yaw 180 --pitch 5 --hfov 110 [--protect]
    python3 scripts/render/pano_faces.py sky <pano> <out-pano> --from-lat 40 [--ramp 10]

Angles are degrees. Yaw 0 is the panorama's centre and positive yaw turns left (the convention of
pano_composite.py); pitch is up. `merge` reprojects an edited view back with feathered edges; `--protect` leaves
Eric's photo untouched (the band pano_composite.py placed: 175° wide, 26° below to 34° above the horizon). `sky`
replaces everything above a latitude with a smooth gradient sampled from the sky just below it.
Needs Pillow (system Python); not a project dependency. Pure-Python pixel loops: tens of seconds per call at 8K.
"""

import argparse
import math

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("command", choices=["extract", "merge", "sky"])
parser.add_argument("paths", nargs="+")
parser.add_argument("--yaw", type=float, default=0.0)
parser.add_argument("--pitch", type=float, default=0.0)
parser.add_argument("--hfov", type=float, default=100.0)
parser.add_argument("--width", type=int, default=1920)
parser.add_argument("--height", type=int, default=1080)
parser.add_argument("--feather", type=float, default=0.12, help="edge blend as a share of the view's width")
parser.add_argument("--protect", action="store_true", help="never overwrite Eric's photo band")
parser.add_argument("--from-lat", type=float, default=40.0)
parser.add_argument("--ramp", type=float, default=10.0)
args = parser.parse_args()

PHOTO_HALF_WIDTH, PHOTO_TOP, PHOTO_BOTTOM = 87.5, 34.0, -26.0
rad = math.radians


def basis(yaw: float, pitch: float):
    """Forward, right and up vectors for a view; x points left so that yaw (left positive) = atan2(x, z)."""
    y, p = rad(yaw), rad(pitch)
    forward = (math.sin(y) * math.cos(p), math.sin(p), math.cos(y) * math.cos(p))
    right = (-math.cos(y), 0.0, math.sin(y))
    up = (-math.sin(y) * math.sin(p), math.cos(p), -math.cos(y) * math.sin(p))
    return forward, right, up


def to_pixel(lon: float, lat: float, w: int, h: int):
    return (w / 2 - lon / (2 * math.pi) * w) % w, h / 2 - lat / math.pi * h


def lon_lat(x: float, y: float, w: int, h: int):
    return (w / 2 - x) / w * 2 * math.pi, (h / 2 - y) / h * math.pi


def extract(pano_path: str, out_path: str):
    pano = Image.open(pano_path).convert("RGB")
    W, H = pano.size
    src = pano.load()
    w, h = args.width, args.height
    tx = math.tan(rad(args.hfov) / 2)
    ty = tx * h / w
    f, r, u = basis(args.yaw, args.pitch)
    out = Image.new("RGB", (w, h))
    dst = out.load()
    for j in range(h):
        b = (1 - 2 * (j + 0.5) / h) * ty
        for i in range(w):
            a = (2 * (i + 0.5) / w - 1) * tx
            dx, dy, dz = f[0] + a * r[0] + b * u[0], f[1] + a * r[1] + b * u[1], f[2] + a * r[2] + b * u[2]
            x, y = to_pixel(math.atan2(dx, dz), math.atan2(dy, math.hypot(dx, dz)), W, H)
            dst[i, j] = src[int(x) % W, min(H - 1, max(0, int(y)))]
    out.save(out_path)
    print(f"{out_path}: {w}×{h}, yaw {args.yaw}, pitch {args.pitch}, {args.hfov}° wide")


def protected(lon: float, lat: float) -> float:
    """1 inside Eric's photo band, fading to 0 over 3° outside it."""
    if not args.protect:
        return 0.0
    d = max(abs(math.degrees(lon)) - PHOTO_HALF_WIDTH, math.degrees(lat) - PHOTO_TOP, PHOTO_BOTTOM - math.degrees(lat))
    return 1.0 if d <= 0 else max(0.0, 1 - d / 3)


def merge(pano_path: str, edited_path: str, out_path: str):
    pano = Image.open(pano_path).convert("RGB")
    W, H = pano.size
    dst = pano.load()
    edited = Image.open(edited_path).convert("RGB")
    w, h = edited.size
    src = edited.load()
    tx = math.tan(rad(args.hfov) / 2)
    ty = tx * h / w
    f, r, u = basis(args.yaw, args.pitch)
    feather = args.feather * w
    changed = 0
    for y in range(H):
        for x in range(W):
            lon, lat = lon_lat(x + 0.5, y + 0.5, W, H)
            dx, dy, dz = math.sin(lon) * math.cos(lat), math.sin(lat), math.cos(lon) * math.cos(lat)
            z = dx * f[0] + dy * f[1] + dz * f[2]
            if z <= 0.05:
                continue
            a = (dx * r[0] + dy * r[1] + dz * r[2]) / z
            b = (dx * u[0] + dy * u[1] + dz * u[2]) / z
            i, j = (a / tx + 1) / 2 * w, (1 - b / ty) / 2 * h
            if not (0 <= i < w and 0 <= j < h):
                continue
            edge = min(i, w - 1 - i, j, h - 1 - j)
            alpha = min(1.0, edge / feather) * (1 - protected(lon, lat))
            if alpha <= 0:
                continue
            e, o = src[int(i), int(j)], dst[x, y]
            dst[x, y] = tuple(round(o[k] + (e[k] - o[k]) * alpha) for k in range(3))
            changed += 1
    pano.save(out_path, quality=95)
    print(f"{out_path}: merged {changed:,} pixels from {edited_path}")


def sky(pano_path: str, out_path: str):
    pano = Image.open(pano_path).convert("RGB")
    W, H = pano.size
    px = pano.load()
    _, y0 = to_pixel(0, rad(args.from_lat), W, H)
    _, y1 = to_pixel(0, rad(args.from_lat + args.ramp), W, H)
    # Base colour: the average sky over the photo's columns just below the start latitude; the zenith is a touch deeper.
    x_lo, x_hi = int(W / 2 - W * PHOTO_HALF_WIDTH / 360), int(W / 2 + W * PHOTO_HALF_WIDTH / 360)
    band = [px[x, int(y0) + 6] for x in range(x_lo, x_hi, 4)]
    base = [sum(c[k] for c in band) / len(band) for k in range(3)]
    zenith = [base[0] * 0.86, base[1] * 0.9, base[2] * 0.97]
    for y in range(0, int(y0) + 1):
        t = min(1.0, max(0.0, (y0 - y) / max(1.0, y0 - y1)))  # 0 at from-lat, 1 above the ramp
        k_up = y / max(1.0, y0)  # 0 at the zenith, 1 at from-lat
        colour = [zenith[k] + (base[k] - zenith[k]) * k_up for k in range(3)]
        lat = lon_lat(0, y + 0.5, W, H)[1]
        for x in range(W):
            a = t * (1 - protected(lon_lat(x + 0.5, 0, W, H)[0], lat))
            if a <= 0:
                continue
            o = px[x, y]
            px[x, y] = tuple(round(o[k] + (colour[k] - o[k]) * a) for k in range(3))
    pano.save(out_path, quality=95)
    print(f"{out_path}: sky above {args.from_lat}° (full above {args.from_lat + args.ramp}°), colour {[round(c) for c in base]}")


if args.command == "extract":
    extract(*args.paths)
elif args.command == "merge":
    merge(*args.paths)
else:
    sky(*args.paths)
