// How far a Marble world holds up before it degrades, measured from its .spz splats.
//
//   node scripts/render/splat-reach.mts <world> [<world> …]
//
// <world> is a folder name under ~/build/wildlabs-assets/worlds/ (full_res.spz plus world.json). Splats are put in
// metres the way the spike page does (rotate 180° about X, scale by metric_scale_factor, lift by
// ground_plane_offset), then grouped in rings by horizontal distance from the viewer at the origin. For each ring it
// prints how many ground splats (within 3 m of the ground) cover each square metre and their median size. Near the
// viewer the ground is dense and fine; where density falls under 10% of the 2–5 m ring, or the median ground splat
// grows past 0.3 m, the world reads as smeared. That radius is the "reach". It's a proxy: check it against
// screenshots.
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const RINGS = [0, 2, 5, 10, 15, 20, 30, 40, 60, 80, 120, 160, 250, 400];
const GROUND_BAND_M = 3;
const DENSITY_FLOOR = 0.1;
const SIZE_CEILING_M = 0.3;

function readSpz(raw: Buffer) {
  const data = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw;
  const magic = data.readUInt32LE(0);
  const version = data.readUInt32LE(4);
  const n = data.readUInt32LE(8);
  if (magic !== 0x5053474e || (version !== 2 && version !== 3)) {
    throw new Error(`Unsupported SPZ (magic ${magic.toString(16)}, version ${version})`);
  }
  const fixed = 1 << data[13];
  const xyz = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) {
    const o = 16 + i * 3;
    let v = data[o] | (data[o + 1] << 8) | (data[o + 2] << 16);
    if (v & 0x800000) v -= 1 << 24;
    xyz[i] = v / fixed;
  }
  const alphaAt = 16 + n * 9;
  const scaleAt = alphaAt + n + n * 3; // alphas, then colours
  const alpha = (i: number) => data[alphaAt + i] / 255;
  // Largest of the three axes; scales are stored as log values in 1/16 steps from −10.
  const size = (i: number) => {
    const o = scaleAt + i * 3;
    return Math.exp(Math.max(data[o], data[o + 1], data[o + 2]) / 16 - 10);
  };
  return { n, xyz, alpha, size };
}

/** Densest 2 cm layer below the camera within 10 raw units of it: the ground, in raw units (OpenCV y is down). */
function groundBelowCamera(n: number, xyz: Float32Array, alpha: (i: number) => number) {
  const bins = new Uint32Array(250);
  for (let i = 0; i < n; i++) {
    const y = xyz[i * 3 + 1];
    if (y <= 0.1 || y >= 5 || alpha(i) <= 0.2 || Math.hypot(xyz[i * 3], xyz[i * 3 + 2]) >= 10) continue;
    bins[Math.floor(y / 0.02)]++;
  }
  return (bins.indexOf(Math.max(...bins)) + 0.5) * 0.02;
}

const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = xs.sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const percentile = (sorted: Float64Array, p: number) => sorted[Math.floor((sorted.length - 1) * p)];

for (const world of process.argv.slice(2)) {
  const dir = path.join(homedir(), "build/wildlabs-assets/worlds", world);
  const meta = JSON.parse(await readFile(path.join(dir, "world.json"), "utf8")).assets.splats.semantics_metadata;
  const { n, xyz, alpha, size } = readSpz(await readFile(path.join(dir, "full_res.spz")));
  const ground = groundBelowCamera(n, xyz, alpha);
  // marble-1.0-draft worlds come without semantics metadata: assume raw units are metres (Marble's are close;
  // draft 1 was 1.26) and lift by the estimated ground, so the meadow sits at y = 0 as it would in the spike.
  const scale: number = meta?.metric_scale_factor ?? 1;
  const lift: number = meta?.ground_plane_offset ?? ground;
  console.log(
    `\n${world}: estimated ground ${ground.toFixed(3)} raw units below the camera` +
      (meta ? ` (metadata: ${(meta.ground_plane_offset / meta.metric_scale_factor).toFixed(3)})` : " (no metadata)"),
  );

  const radii = new Float64Array(n);
  const rings = RINGS.slice(1).map(() => [] as number[]);
  for (let i = 0; i < n; i++) {
    // OpenCV frame → y up: rotating 180° about X flips y and z.
    const x = xyz[i * 3] * scale;
    const y = -xyz[i * 3 + 1] * scale + lift;
    const z = -xyz[i * 3 + 2] * scale;
    const r = Math.hypot(x, z);
    radii[i] = r;
    if (Math.abs(y) >= GROUND_BAND_M || alpha(i) <= 0.2) continue;
    const k = RINGS.findIndex((lo, j) => j + 1 < RINGS.length && r >= lo && r < RINGS[j + 1]);
    if (k >= 0) rings[k].push(size(i) * scale);
  }
  radii.sort();

  console.log(`  ${n.toLocaleString()} splats, metric scale ${scale.toFixed(3)}, ground offset ${lift.toFixed(3)}`);
  console.log(
    `  horizontal extent: half within ${percentile(radii, 0.5).toFixed(0)} m, 90% within ${percentile(radii, 0.9).toFixed(0)} m, ` +
      `99% within ${percentile(radii, 0.99).toFixed(0)} m`,
  );
  console.log("  ring (m)       ground splats/m²   median ground splat (m)");
  let base = 0;
  let reach: number | null = null;
  rings.forEach((sizes, k) => {
    const lo = RINGS[k];
    const hi = RINGS[k + 1];
    const density = sizes.length / (Math.PI * (hi * hi - lo * lo));
    const med = median(sizes);
    if (lo === 2) base = density;
    if (reach === null && lo >= 5 && (density < DENSITY_FLOOR * base || med > SIZE_CEILING_M)) reach = lo;
    const mark = reach === lo ? "   ← degrades" : "";
    console.log(`  ${`${lo}–${hi}`.padEnd(10)} ${density.toFixed(1).padStart(16)}   ${med.toFixed(3).padStart(12)}${mark}`);
  });
  console.log(`  reach: about ${reach ?? RINGS.at(-1)} m from the viewer`);
}
