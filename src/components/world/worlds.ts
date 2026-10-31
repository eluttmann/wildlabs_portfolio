import type { Vec3 } from "@/lab/layouts";

/** Splat resolutions World Labs returns for every Marble world. */
export type SplatRes = "100k" | "150k" | "500k" | "full_res";

export interface SplatWorld {
  /** Also the folder under ~/build/wildlabs-assets/worlds/ that development serves the splats from (see
   * app/spikes/splats); deployments load the World Labs CDN files below. */
  id: string;
  label: string;
  /** Name in a spike's world switcher. */
  short: string;
  /** World Labs world id, for the log and re-exports. */
  worldId: string;
  /**
   * World Labs asset CDN (public, CORS-enabled). In development the same files are served from
   * ~/build/wildlabs-assets/worlds/<id>/<res>.spz instead; see app/spikes/splats.
   */
  spz: Partial<Record<SplatRes, string>>;
  /** From assets.splats.semantics_metadata: raw Marble units → metres, ground at y = 0. */
  metricScale: number;
  groundOffset: number;
  /** Viewer position and look target in metres (y up, ground at 0). */
  camera: { position: Vec3; target: Vec3 };
  /** Three orbs, one per region, placed in the world in metres. */
  orbs: { slug: string; position: Vec3; size: number }[];
  /** How far the camera may pull back from its target, in metres; defaults to 14. */
  maxDistance?: number;
  /**
   * A sharp 2:1 panorama drawn at infinity behind the splats: a full URL (Vercel Blob, store `wildlabs-worlds`;
   * upload with scripts/render/blob-put.mts) or a file name in the world's local asset folder (development only).
   */
  backdrop?: string;
}

const meadowOrbs: SplatWorld["orbs"] = [
  { slug: "immersive-workspaces", position: [-3.2, 1.6, -7], size: 0.5 },
  { slug: "pillar", position: [0, 1.9, -9], size: 0.5 },
  { slug: "langgraph-studio", position: [3.4, 1.7, -7.5], size: 0.5 },
];

/*
 * Bike-ride stop 1, El Capitan Meadow (chosen Oct 30): Eric's IMG_9486 at its true width in an 8K panorama
 * (scripts/render/pano_composite.py), near field cleaned (scripts/render/pano_faces.py: open sky overhead, trees
 * pushed back behind the viewer, no shadow underfoot), generated with marble-1.1-plus. Earlier drafts, options and
 * the uncleaned photo plus are archived in ~/build/wildlabs-assets/archive/worlds/; their world ids and verdicts are
 * in docs/renders/LOG.md.
 */
export const yosemitePhotoPlusV2: SplatWorld = {
  id: "yosemite-photo-plus-v2",
  label: "Yosemite, El Capitan Meadow",
  short: "Photo plus v2",
  worldId: "6a49de28-79ab-48e9-a445-c54bbe9c86f7",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/6a49de28-79ab-48e9-a445-c54bbe9c86f7/05894ab0-ec0d-419b-9d37-4481d1414dbc_dust_100k.spz",
    "150k": "https://cdn.marble.worldlabs.ai/6a49de28-79ab-48e9-a445-c54bbe9c86f7/527ac474-62f7-47f4-9be2-35f01e3a1d70_ceramic_150k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/6a49de28-79ab-48e9-a445-c54bbe9c86f7/4394016f-3bb7-423b-9d40-f4a569a1605b_ceramic_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/6a49de28-79ab-48e9-a445-c54bbe9c86f7/9c7bbae0-a5e4-41ef-9709-06ca74443b33_ceramic.spz",
  },
  metricScale: 1.7705405950546265,
  groundOffset: 1.1282386779785156,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  backdrop:
    "https://zxnwq2jadfb7nyua.public.blob.vercel-storage.com/worlds/yosemite-meadow/backdrop-8k-e30vKpdVnFiwSuDBnevAUiNrUX4zwY.jpg",
};

/** The 3D home's world. */
export const homeWorld = yosemitePhotoPlusV2;

/** The worlds /spikes/yosemite can switch between; the current one first. */
export const yosemiteWorlds = [yosemitePhotoPlusV2];
