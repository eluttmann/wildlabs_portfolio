/**
 * The six spatial structures explored in M1. Each layout is a pure function from content to
 * orb positions, sizes, a camera preset and guides, so the lab can morph between them.
 */
import { REGIONS, SCALES, SCALE_LABELS, type Project, type Region, type Role } from "@/content/projects";

export type Vec3 = [number, number, number];

export type Guide =
  | { kind: "label"; text: string; position: Vec3; tone?: "muted" | "strong" }
  | { kind: "ring"; radius: number; y: number }
  | { kind: "line"; points: Vec3[] }
  | { kind: "sphere"; radius: number }
  | { kind: "core"; position: Vec3; label: string };

export interface LayoutResult {
  positions: Record<string, Vec3>;
  sizes: Record<string, number>;
  camera: { position: Vec3; target: Vec3 };
  guides: Guide[];
  /** Slugs to render faded, e.g. placeholder locations on the globe. */
  faded?: string[];
}

export interface LayoutContext {
  /** Slugs matching the current question, if any. */
  matches: Set<string> | null;
}

export interface LayoutDef {
  id: LayoutId;
  name: string;
  blurb: string;
  build: (projects: Project[], ctx: LayoutContext) => LayoutResult;
}

export type LayoutId = "powers" | "thesis" | "braid" | "globe" | "orbit" | "semantic";

const BASE = 0.42;

// 1 ── Powers of Ten ────────────────────────────────────────────────
const powers: LayoutDef = {
  id: "powers",
  name: "Powers of Ten",
  blurb: "Rings by scale, from a room out to an audience of millions. Zooming out is the navigation.",
  build(projects) {
    const radius = (lvl: number) => 1.8 * Math.pow(1.55, lvl);
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    const guides: Guide[] = [];
    SCALES.forEach((scale, lvl) => {
      const r = radius(lvl);
      guides.push({ kind: "ring", radius: r, y: -1.2 });
      guides.push({ kind: "label", text: SCALE_LABELS[scale], position: [0, -1.2, r + 0.35], tone: "muted" });
      const members = projects.filter((p) => p.scale === scale);
      members.forEach((p, i) => {
        const a = lvl * 1.3 + 0.6 + (i - (members.length - 1) / 2) * (1.1 / Math.sqrt(r));
        positions[p.slug] = [Math.cos(a) * r, 0.15 * lvl, Math.sin(a) * r];
        sizes[p.slug] = BASE * 0.8 * Math.pow(1.14, lvl);
      });
    });
    return { positions, sizes, guides, camera: { position: [0, 24, 34], target: [0, 0, 1.5] } };
  },
};

// 2 ── Thesis field ─────────────────────────────────────────────────
const thesis: LayoutDef = {
  id: "thesis",
  name: "Thesis field",
  blurb: "Spatial to AI across, creation to knowledge up. The layout states the thesis, and Pillar sits where the threads meet.",
  build(projects) {
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    for (const p of projects) {
      positions[p.slug] = [p.thesis.spatialToAI * 7, p.thesis.creationToKnowledge * 4 + 0.6, (p.order - 4) * 0.3];
      sizes[p.slug] = p.slug === "pillar" ? BASE * 1.3 : BASE;
    }
    const y0 = 0.6;
    const guides: Guide[] = [
      { kind: "line", points: [[-8, y0, 0], [8, y0, 0]] },
      { kind: "line", points: [[0, y0 - 4.8, 0], [0, y0 + 4.8, 0]] },
      { kind: "label", text: "Spatial", position: [-8.9, y0, 0], tone: "strong" },
      { kind: "label", text: "AI", position: [8.6, y0, 0], tone: "strong" },
      { kind: "label", text: "Knowledge", position: [0, y0 + 5.3, 0], tone: "strong" },
      { kind: "label", text: "Creation", position: [0, y0 - 5.3, 0], tone: "strong" },
    ];
    return { positions, sizes, guides, camera: { position: [0, 0.2, 19], target: [0, 0.2, 0] } };
  },
};

// 3 ── Convergence braid ────────────────────────────────────────────
const braidPoint = (order: number, phase: number): Vec3 => {
  const r = 2.4 * (1 - order / 8) + 0.15;
  const th = order * 0.85 + phase;
  return [(order - 4) * 2.3, Math.cos(th) * r + 0.4, Math.sin(th) * r];
};
const braid: LayoutDef = {
  id: "braid",
  name: "Convergence braid",
  blurb: "A spatial strand and an AI strand spiral forward through time and fuse at Pillar. Order is approximate.",
  build(projects) {
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    for (const p of projects) {
      positions[p.slug] = braidPoint(p.order, p.strand === "spatial" ? 0 : Math.PI);
      sizes[p.slug] = BASE * (0.85 + p.order * 0.04);
    }
    const sample = (phase: number) => {
      const pts: Vec3[] = [];
      for (let o = -0.6; o <= 8.01; o += 0.1) pts.push(braidPoint(o, phase));
      return pts;
    };
    const guides: Guide[] = [
      { kind: "line", points: sample(0) },
      { kind: "line", points: sample(Math.PI) },
      { kind: "label", text: "Earlier", position: [-11.2, -2.4, 0], tone: "muted" },
      { kind: "label", text: "Now", position: [10.2, -2.4, 0], tone: "muted" },
      { kind: "label", text: "Spatial strand", position: [braidPoint(-0.6, 0)[0], 3.4, 0], tone: "strong" },
      { kind: "label", text: "AI strand", position: [braidPoint(-0.6, 0)[0], -2.9, 0], tone: "strong" },
    ];
    return { positions, sizes, guides, camera: { position: [0, 2.8, 22], target: [0, 0.4, 0] } };
  },
};

// 4 ── Globe ────────────────────────────────────────────────────────
const deg = Math.PI / 180;
const globe: LayoutDef = {
  id: "globe",
  name: "Globe",
  blurb: "Projects pinned to real places. Faded orbs are placeholder locations to confirm.",
  build(projects) {
    const R = 4.4;
    const lon0 = -98 * deg;
    const lat0 = 38 * deg;
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    const placed: { lat: number; lon: number }[] = [];
    for (const p of projects) {
      const { lat, lon } = p.location;
      const stack = placed.filter((q) => Math.hypot(q.lat - lat, q.lon - lon) < 4).length;
      placed.push({ lat, lon });
      const r = R * (1.08 + stack * 0.2);
      const phi = lat * deg;
      const lam = lon * deg - lon0;
      const x = r * Math.cos(phi) * Math.sin(lam);
      const y = r * Math.sin(phi);
      const z = r * Math.cos(phi) * Math.cos(lam);
      positions[p.slug] = [x, y * Math.cos(lat0) - z * Math.sin(lat0), y * Math.sin(lat0) + z * Math.cos(lat0)];
      sizes[p.slug] = BASE * 0.5;
    }
    return {
      positions,
      sizes,
      guides: [{ kind: "sphere", radius: R }],
      faded: projects.filter((p) => !p.location.confirmed).map((p) => p.slug),
      camera: { position: [0, 1, 14], target: [0, 0, 0] },
    };
  },
};

// 5 ── Orbital roles ────────────────────────────────────────────────
const ROLE_ANGLE: Record<Role, number> = { product: 0, design: Math.PI / 2, engineering: Math.PI, brand: (3 * Math.PI) / 2 };
const orbit: LayoutDef = {
  id: "orbit",
  name: "Orbital roles",
  blurb: "Sectors by primary role. The more hats a project needed, the closer it sits to the centre.",
  build(projects) {
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    const ringFor = (n: number) => 6 - Math.min(n, 3) * 1.25;
    (Object.keys(ROLE_ANGLE) as Role[]).forEach((role) => {
      const members = projects.filter((p) => p.roles[0] === role);
      members.forEach((p, i) => {
        const a = ROLE_ANGLE[role] + (i - (members.length - 1) / 2) * 0.62;
        const r = ringFor(p.roles.length);
        positions[p.slug] = [Math.sin(a) * r, 0, Math.cos(a) * r];
        sizes[p.slug] = BASE * 0.9;
      });
    });
    const guides: Guide[] = [
      { kind: "core", position: [0, 0, 0], label: "Eric" },
      ...[1, 2, 3].map((n): Guide => ({ kind: "ring", radius: ringFor(n), y: 0 })),
      ...(Object.entries(ROLE_ANGLE) as [Role, number][]).map(
        ([role, a]): Guide => ({ kind: "label", text: role, position: [Math.sin(a) * 6.4, 0, Math.cos(a) * 6.4], tone: "strong" }),
      ),
    ];
    return { positions, sizes, guides, camera: { position: [0, 12, 11], target: [0, 0, 0] } };
  },
};

// 6 ── Semantic field ───────────────────────────────────────────────
const tokensOf = (p: Project) => new Set([...p.keywords, p.region, p.scale, p.strand, ...p.roles]);
const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
};
const semantic: LayoutDef = {
  id: "semantic",
  name: "Semantic field",
  blurb: "Clusters form by similarity. Ask a question and the field re-forms around the answer.",
  build(projects, { matches }) {
    const toks = projects.map(tokensOf);
    const n = projects.length;
    const pts = projects.map((p, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * 4, Math.sin(a) * 4];
    });
    for (let it = 0; it < 500; it++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pts[j][0] - pts[i][0];
          const dy = pts[j][1] - pts[i][1];
          const d = Math.hypot(dx, dy) || 0.001;
          const target = 1.8 + (1 - jaccard(toks[i], toks[j])) * 6;
          const f = ((d - target) / d) * 0.02;
          pts[i][0] += dx * f; pts[i][1] += dy * f;
          pts[j][0] -= dx * f; pts[j][1] -= dy * f;
        }
      }
    }
    const cx = pts.reduce((s, p) => s + p[0], 0) / n;
    const cy = pts.reduce((s, p) => s + p[1], 0) / n;
    const positions: Record<string, Vec3> = {};
    const sizes: Record<string, number> = {};
    projects.forEach((p, i) => {
      let x = pts[i][0] - cx;
      let z = pts[i][1] - cy;
      if (matches && matches.size) {
        const len = Math.hypot(x, z) || 1;
        if (matches.has(p.slug)) { x *= 0.6; z *= 0.6; }
        else { const k = Math.max(len, 9) / len; x *= k; z *= k; }
      }
      positions[p.slug] = [x, 0.35 * Math.sin(i * 1.7), z];
      sizes[p.slug] = BASE * (matches?.has(p.slug) ? 1.15 : 0.9);
    });
    const guides: Guide[] = (Object.keys(REGIONS) as Region[]).map((region) => {
      const members = projects.filter((p) => p.region === region);
      const gx = members.reduce((s, p) => s + positions[p.slug][0], 0) / members.length;
      const gz = members.reduce((s, p) => s + positions[p.slug][2], 0) / members.length;
      return { kind: "label", text: REGIONS[region].label, position: [gx, -1.2, gz], tone: "muted" };
    });
    return { positions, sizes, guides, camera: { position: [0, 12, 13], target: [0, 0, 0] } };
  },
};

export const LAYOUTS: LayoutDef[] = [powers, thesis, braid, globe, orbit, semantic];
export const layoutById = Object.fromEntries(LAYOUTS.map((l) => [l.id, l])) as Record<LayoutId, LayoutDef>;
