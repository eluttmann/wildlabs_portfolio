import type { Vec3 } from "@/lab/layouts";

/** Splat resolutions World Labs returns for every Marble world. */
export type SplatRes = "100k" | "150k" | "500k" | "full_res";

export interface SplatWorld {
  /** Also the folder under ~/build/wildlabs-assets/worlds/ that development serves the splats from. */
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
  /** A sharp 2:1 panorama in the world's asset folder, drawn at infinity behind the splats (development only). */
  backdrop?: string;
}

const meadowOrbs: SplatWorld["orbs"] = [
  { slug: "immersive-workspaces", position: [-3.2, 1.6, -7], size: 0.5 },
  { slug: "pillar", position: [0, 1.9, -9], size: 0.5 },
  { slug: "langgraph-studio", position: [3.4, 1.7, -7.5], size: 0.5 },
];

export const yosemite: SplatWorld = {
  id: "yosemite",
  label: "Yosemite, El Capitan Meadow",
  short: "Draft 1 · photo",
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
  orbs: meadowOrbs,
};

/*
 * Bike-ride stop 1, El Capitan Meadow: marble-1.0-draft worlds (Oct 28). Drafts ship no semantics metadata, so the
 * scale assumes Marble's raw units are metres and the ground offset is estimated from the splats
 * (scripts/render/splat-reach.mts). The camera may pull back to 40 m so the review can see where each world degrades.
 */
export const yosemiteMeadowText: SplatWorld = {
  id: "yosemite-meadow-text",
  label: "Yosemite, El Capitan Meadow · draft from text",
  short: "Draft · text",
  worldId: "4ab4e3c4-cbc2-4103-aeb6-499191741ed6",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/4ab4e3c4-cbc2-4103-aeb6-499191741ed6/8d6e2e2e-4847-4ce4-b458-d92e5b1af89a_sand_100k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/4ab4e3c4-cbc2-4103-aeb6-499191741ed6/846cb997-363e-4842-b50d-5b8b95ac1982_sand_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/4ab4e3c4-cbc2-4103-aeb6-499191741ed6/2facc230-f0fb-416b-b338-476db023a4cc_sand.spz",
  },
  metricScale: 1,
  groundOffset: 0.57,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  maxDistance: 40,
};

export const yosemiteMeadowImage: SplatWorld = {
  id: "yosemite-meadow-image",
  label: "Yosemite, El Capitan Meadow · draft from text and the hero still",
  short: "Draft · text and still",
  worldId: "974287d3-dc36-4d82-aea4-d7d56d37f7f4",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/974287d3-dc36-4d82-aea4-d7d56d37f7f4/d2cca382-8beb-4d2c-b1db-85c0420b146a_sand_100k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/974287d3-dc36-4d82-aea4-d7d56d37f7f4/6d21a610-cd20-458b-909e-94366d2cd1f5_sand_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/974287d3-dc36-4d82-aea4-d7d56d37f7f4/57341180-fda6-470f-9d25-750afbb16329_sand.spz",
  },
  metricScale: 1,
  groundOffset: 0.59,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  maxDistance: 40,
};

/*
 * Fidelity round (Oct 30): full-tier worlds, judged standing still at the standpoint on a 16-inch MacBook Pro.
 */
export const yosemiteTextPlus: SplatWorld = {
  id: "yosemite-meadow-text-plus",
  label: "Yosemite, El Capitan Meadow · option B, text, marble-1.1-plus",
  short: "B · text plus",
  worldId: "97ee9c0f-05a6-4f3f-adfb-6275d7b13f24",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/97ee9c0f-05a6-4f3f-adfb-6275d7b13f24/53ba97fd-2a67-4138-874c-a32b01b67557_dust_100k.spz",
    "150k": "https://cdn.marble.worldlabs.ai/97ee9c0f-05a6-4f3f-adfb-6275d7b13f24/d4eeabd3-b943-4b0e-866e-c329187a3805_ceramic_150k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/97ee9c0f-05a6-4f3f-adfb-6275d7b13f24/04274a56-6bd2-4ea2-8198-70b69fe3e204_ceramic_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/97ee9c0f-05a6-4f3f-adfb-6275d7b13f24/7346f401-ac13-4b91-8905-914d91d26dfd_ceramic.spz",
  },
  metricScale: 1.7702996730804443,
  groundOffset: 1.1088249683380127,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  backdrop: "pano.jpg",
};

/** Option A: IMG_9486 composited at its true width into an 8K panorama (scripts/render/pano_composite.py). */
export const yosemitePhoto11: SplatWorld = {
  id: "yosemite-photo-11",
  label: "Yosemite, El Capitan Meadow · option A, your photo, marble-1.1",
  short: "A · photo 1.1",
  worldId: "f37bbf05-3b4c-44c1-9bdb-6f5f8cd82efa",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/f37bbf05-3b4c-44c1-9bdb-6f5f8cd82efa/ecae8bf1-a49e-4416-93c4-680beff4e256_dust_100k.spz",
    "150k": "https://cdn.marble.worldlabs.ai/f37bbf05-3b4c-44c1-9bdb-6f5f8cd82efa/ccf60c7d-94ba-4212-9303-2cded2e39031_ceramic_150k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/f37bbf05-3b4c-44c1-9bdb-6f5f8cd82efa/1a8f7196-7d5c-4a4b-954b-0acdde9410cd_ceramic_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/f37bbf05-3b4c-44c1-9bdb-6f5f8cd82efa/e5944abf-bd31-4793-9709-e8ce60857387_ceramic.spz",
  },
  metricScale: 2.601943254470825,
  groundOffset: 1.1130276918411255,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  backdrop: "backdrop-8k.jpg",
};

/** Option A again, from the same 8K panorama at the top tier. */
export const yosemitePhotoPlus: SplatWorld = {
  id: "yosemite-photo-plus",
  label: "Yosemite, El Capitan Meadow · option A, your photo, marble-1.1-plus",
  short: "A · photo plus",
  worldId: "83440d8a-39f8-4262-ac0e-878a14a5a86e",
  spz: {
    "100k": "https://cdn.marble.worldlabs.ai/83440d8a-39f8-4262-ac0e-878a14a5a86e/4aa36b9c-5940-446b-bd37-c299bcdf47ae_dust_100k.spz",
    "150k": "https://cdn.marble.worldlabs.ai/83440d8a-39f8-4262-ac0e-878a14a5a86e/a8fcb52c-1eec-4545-bfbc-9f4f214de7a0_ceramic_150k.spz",
    "500k": "https://cdn.marble.worldlabs.ai/83440d8a-39f8-4262-ac0e-878a14a5a86e/c3b404f8-8467-48b8-82f8-ffbe115bac9a_ceramic_500k.spz",
    full_res: "https://cdn.marble.worldlabs.ai/83440d8a-39f8-4262-ac0e-878a14a5a86e/cd908c39-9dd8-43e7-8bfc-5b61bb66859d_ceramic.spz",
  },
  metricScale: 1.6856319904327393,
  groundOffset: 0.9198150634765625,
  camera: { position: [0, 1.6, 0], target: [0, 1.2, -10] },
  orbs: meadowOrbs,
  backdrop: "backdrop-8k.jpg",
};

/** The worlds /spikes/yosemite can switch between; the newest first. */
export const yosemiteWorlds = [
  yosemitePhotoPlus,
  yosemitePhoto11,
  yosemiteTextPlus,
  yosemiteMeadowText,
  yosemiteMeadowImage,
  yosemite,
];
