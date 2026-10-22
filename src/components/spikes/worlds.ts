import type { Vec3 } from "@/lab/layouts";

/** Splat resolutions World Labs returns for every Marble world. */
export type SplatRes = "100k" | "500k" | "full_res";

export interface SplatWorld {
  id: string;
  label: string;
  /** World Labs world id, for the log and re-exports. */
  worldId: string;
  /**
   * Remote SPZ URLs (World Labs asset CDN). In development the files are served from
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
}

export const yosemite: SplatWorld = {
  id: "yosemite",
  label: "Yosemite, El Capitan Meadow",
  worldId: "",
  spz: {},
  metricScale: 1,
  groundOffset: 0,
  camera: { position: [0, 1.6, 0], target: [0, 1.6, -10] },
  orbs: [
    { slug: "immersive-workspaces", position: [-3.2, 1.7, -7], size: 0.55 },
    { slug: "pillar", position: [0, 2.1, -9], size: 0.55 },
    { slug: "langgraph-studio", position: [3.4, 1.8, -7.5], size: 0.55 },
  ],
};
