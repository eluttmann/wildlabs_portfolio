import type { Vec3 } from "@/lab/layouts";

/** Splat resolutions World Labs returns for every Marble world. */
export type SplatRes = "100k" | "150k" | "500k" | "full_res";

export interface SplatWorld {
  id: string;
  label: string;
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
}

export const yosemite: SplatWorld = {
  id: "yosemite",
  label: "Yosemite, El Capitan Meadow",
  worldId: "fda35fe5-b13c-4222-a60b-218654e9849f",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/fda35fe5-b13c-4222-a60b-218654e9849f/1c7a04b6-3acc-451b-9f7f-bda73a987181_dust_100k.spz",
    "150k": "https://cdn.marble.worldlabs.ai/fda35fe5-b13c-4222-a60b-218654e9849f/f347f46b-7f74-4857-83e3-a7ef029c8f06_ceramic_150k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/fda35fe5-b13c-4222-a60b-218654e9849f/7b52f99b-d06f-4b6b-a076-268a473dd0b1_ceramic_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/fda35fe5-b13c-4222-a60b-218654e9849f/560ff5e9-246a-4b2a-83fc-0e95a166446e_ceramic.spz",
  },
  metricScale: 1.2618842124938965,
  groundOffset: 0.5370222330093384,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: [
    { slug: "immersive-workspaces", position: [-3.2, 1.6, -7], size: 0.5 },
    { slug: "pillar", position: [0, 1.9, -9], size: 0.5 },
    { slug: "langgraph-studio", position: [3.4, 1.7, -7.5], size: 0.5 },
  ],
};
