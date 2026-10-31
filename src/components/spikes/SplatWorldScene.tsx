"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import {
  SparkRenderer,
  SplatEdit,
  SplatEditRgbaBlendMode,
  SplatEditSdf,
  SplatEditSdfType,
  SplatFileType,
  SplatMesh,
} from "@sparkjsdev/spark";
import {
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  NoToneMapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";
import { projectBySlug } from "@/content/projects";
import { Orb } from "@/components/lab/Orb";
import type { Vec3 } from "@/lab/layouts";
import type { SplatRes, SplatWorld } from "./worlds";

export type WorldStatus = "loading" | "ready" | "error";

interface SceneProps {
  world: SplatWorld;
  res: SplatRes;
  onStatus: (status: WorldStatus) => void;
}

const RESOLUTIONS: SplatRes[] = ["100k", "150k", "500k", "full_res"];

/** Plan budget: about 500K splats on phones, full resolution on desktop. `?res=` overrides. */
function pickRes(): SplatRes {
  const asked = new URLSearchParams(window.location.search).get("res");
  if (RESOLUTIONS.includes(asked as SplatRes)) return asked as SplatRes;
  return window.matchMedia("(max-width: 767px)").matches ? "500k" : "full_res";
}

/**
 * Render settings under review for fidelity, each overridable from the URL so a review sheet can compare them:
 * `?tone=none|aces` (no tone curve, or R3F's default ACES curve), `?blur=` (Spark's anti-alias blur), `?focal=`
 * (Spark's projected splat scale; higher is sharper), `?fov=` (vertical degrees) and `?eye=capture|standing` (the
 * height Marble's camera stood at, where the splats are least stretched, or 1.6 m).
 */
interface Look {
  tone: "aces" | "none";
  blur: number;
  focal: number;
  fov: number;
  eye: "standing" | "capture";
  /** Show the world's sharp panorama behind the splats, when it has one (`?backdrop=off` to compare). */
  backdrop: boolean;
  /** Turn the backdrop to line it up with the splats, in degrees (`?turn=`). */
  turn: number;
  /** Fade out splats beyond this many metres, 0 for none (`?cull=`). */
  cull: number;
}

function pickLook(): Look {
  const params = new URLSearchParams(window.location.search);
  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key));
    return params.has(key) && Number.isFinite(v) ? v : fallback;
  };
  return {
    // Oct 30 review: no tone curve (ACES darkened and flattened the splats) and the capture height (standing 1 m
    // above it showed floaters and stretched splats) read best; blur and focal made no visible difference.
    tone: params.get("tone") === "aces" ? "aces" : "none",
    blur: num("blur", 0.3),
    focal: num("focal", 1),
    fov: num("fov", 55),
    eye: params.get("eye") === "standing" ? "standing" : "capture",
    // Backdrop on by default for worlds that have one. three.js starts an equirectangular background 90° away from
    // Marble's panorama, hence the turn; a 25 m cull let the sharp photo replace every splat that would smear.
    backdrop: params.get("backdrop") !== "off",
    turn: num("turn", 90),
    cull: num("cull", params.get("backdrop") === "off" ? 0 : 25),
  };
}

/**
 * Review views: `?at=<metres>` walks the viewer that far down the path (forward is −z) and `?yaw=<degrees>` turns
 * them left, so a review sheet can judge every world from the same spots (scripts/render/review-sheet.mts).
 */
function pickView(world: SplatWorld, look: Look): SplatWorld["camera"] {
  const params = new URLSearchParams(window.location.search);
  const at = Number(params.get("at") ?? 0);
  const yaw = (Number(params.get("yaw") ?? 0) * Math.PI) / 180;
  if (!at && !yaw && !params.has("pitch") && look.eye === "standing") return world.camera;
  const [x, y, z] = world.camera.position;
  // Marble's camera sits at the raw origin, which the ground offset lifts to this height.
  const eyeY = look.eye === "capture" ? world.groundOffset : y;
  const eye: Vec3 = [x, eyeY, z - at];
  // `?pitch=<degrees>` tilts the view up (positive) or down, to review the sky overhead and the ground underfoot.
  const rise = params.has("pitch") ? Math.tan((Number(params.get("pitch")) * Math.PI) / 180) * 10 : -0.4;
  return { position: eye, target: [eye[0] - Math.sin(yaw) * 10, eyeY + rise, eye[2] - Math.cos(yaw) * 10] };
}

function splatUrl(world: SplatWorld, res: SplatRes) {
  return process.env.NODE_ENV === "development" ? `/spikes/splats/${world.id}/${res}.spz` : world.spz[res];
}

/** The world's sharp backdrop panorama; served locally only, so previews fall back to the splats' own sky. */
function backdropUrl(world: SplatWorld) {
  return process.env.NODE_ENV === "development" && world.backdrop
    ? `/spikes/splats/${world.id}/${world.backdrop}`
    : null;
}

const nextFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const tick = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => tick(left - 1)));
    tick(n);
  });

/** Orbs sit at their centroid; the environment map is rendered from there. */
function orbCentroid(world: SplatWorld) {
  const c = new Vector3();
  for (const o of world.orbs) c.add(new Vector3(...o.position));
  return c.divideScalar(world.orbs.length);
}

/**
 * The Marble world as Gaussian splats. Marble SPZ files are OpenCV-framed (y down) in raw units:
 * rotate 180° about X, scale to metres, and lift by the ground offset so the meadow sits at y = 0.
 * Once loaded, the splats are rendered into an environment map so the glass orbs reflect the valley.
 * The orbs mount only after that, so they never appear in their own reflections.
 */
function Splats({ world, res, look, onStatus }: SceneProps & { look: Look }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const spark = useMemo(
    () =>
      new SparkRenderer({
        renderer: gl,
        onDirty: () => invalidate(),
        blurAmount: look.blur,
        focalAdjustment: look.focal,
      }),
    [gl, invalidate, look],
  );
  const url = splatUrl(world, res);

  const mesh = useMemo(() => {
    if (!url) return null;
    const m = new SplatMesh({ url, fileType: SplatFileType.SPZ });
    m.quaternion.set(1, 0, 0, 0);
    m.scale.setScalar(world.metricScale);
    m.position.set(0, world.groundOffset, 0);
    return m;
  }, [url, world]);

  useEffect(() => () => spark.dispose(), [spark]);

  useEffect(() => {
    if (!mesh) {
      onStatus("error");
      return;
    }
    let cancelled = false;
    onStatus("loading");
    mesh.initialized
      .then(async () => {
        // Loaded is not yet drawn: give Spark a few frames to sort and upload before capturing the env map,
        // or the glass refracts an empty (black) map.
        await nextFrames(30);
        if (cancelled) return;
        const envMap = await spark.renderEnvMap({
          scene,
          worldCenter: orbCentroid(world),
          hideObjects: [],
          update: true,
        });
        if (cancelled) return;
        scene.environment = envMap;
        scene.background = envMap;
        const backdrop = look.backdrop && backdropUrl(world);
        if (backdrop) {
          // The sharp panorama at infinity replaces the far splats: mountains barely move within a few metres.
          const texture = await new TextureLoader().loadAsync(backdrop).catch(() => null);
          if (cancelled) return;
          if (texture) {
            texture.mapping = EquirectangularReflectionMapping;
            texture.colorSpace = SRGBColorSpace;
            scene.background = texture;
            scene.backgroundRotation.set(0, (look.turn * Math.PI) / 180, 0);
          }
        }
        onStatus("ready");
      })
      .catch(() => !cancelled && onStatus("error"));
    return () => {
      cancelled = true;
      mesh.dispose();
    };
  }, [mesh, spark, scene, world, look, onStatus]);

  // Fade out splats beyond `look.cull` metres so the backdrop shows through where the splats would smear.
  const cull = useMemo(() => {
    if (!look.cull || !look.backdrop || !backdropUrl(world)) return null;
    const edit = new SplatEdit({ rgbaBlendMode: SplatEditRgbaBlendMode.MULTIPLY, softEdge: look.cull * 0.15 });
    edit.addSdf(new SplatEditSdf({ type: SplatEditSdfType.SPHERE, radius: look.cull, opacity: 0, invert: true }));
    edit.position.set(0, world.groundOffset, 0);
    return edit;
  }, [look.cull, look.backdrop, world]);

  return (
    <>
      <primitive object={spark} />
      {cull && <primitive object={cull} />}
      {mesh && <primitive object={mesh} />}
    </>
  );
}

function CameraRig({ world, selected }: { world: SplatWorld; selected: string | null }) {
  const controls = useRef<ComponentRef<typeof CameraControls>>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const orb = world.orbs.find((o) => o.slug === selected);
    const [px, py, pz] = world.camera.position;
    if (orb) {
      // Push in from the viewer's side, stopping a couple of metres short of the orb.
      const [x, y, z] = orb.position;
      const dir = new Vector3(px - x, py - y, pz - z).normalize().multiplyScalar(2.4);
      void c.setLookAt(x + dir.x, y + dir.y + 0.2, z + dir.z, x, y, z, true);
    } else {
      void c.setLookAt(px, py, pz, ...world.camera.target, true);
    }
  }, [world, selected]);

  // Splat worlds hold up near where the source photo was taken; keep the viewer close to it. A `?pitch=` review
  // view needs to look straight up or down, past the usual tilt limits.
  const [freeTilt] = useState(() => new URLSearchParams(window.location.search).has("pitch"));
  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.7}
      minDistance={1}
      maxDistance={world.maxDistance ?? 14}
      minPolarAngle={freeTilt ? 0.02 : Math.PI * 0.3}
      maxPolarAngle={freeTilt ? Math.PI - 0.02 : Math.PI * 0.56}
    />
  );
}

export default function SplatWorldScene({ world, onStatus }: Omit<SceneProps, "res">) {
  const [res] = useState(pickRes);
  const [ready, setReady] = useState(false);
  const report = useCallback(
    (status: WorldStatus) => {
      setReady(status === "ready");
      onStatus(status);
    },
    [onStatus],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [look] = useState(pickLook);
  const [camera] = useState(() => pickView(world, look));
  const viewed = useMemo(() => ({ ...world, camera }), [world, camera]);

  return (
    <Canvas
      dpr={[1, 2]}
      // Spark recommends no MSAA: it doesn't improve splats and costs a lot of fill rate.
      gl={{ antialias: false, toneMapping: look.tone === "none" ? NoToneMapping : ACESFilmicToneMapping }}
      camera={{ position: camera.position, fov: look.fov, near: 0.05, far: 2000 }}
      onPointerMissed={() => setSelected(null)}
    >
      {/* No scene background until the world loads: the transparent canvas shows the gallery white behind it. */}
      <ambientLight intensity={0.4} />

      <Splats world={world} res={res} look={look} onStatus={report} />

      {ready &&
        world.orbs.map((o, i) => {
          const project = projectBySlug[o.slug];
          if (!project) return null;
          return (
            <Orb
              key={o.slug}
              project={project}
              target={o.position}
              size={o.size}
              dimmed={false}
              selected={selected === o.slug}
              emphasized={false}
              phase={i * 1.7}
              onSelect={setSelected}
            />
          );
        })}

      <CameraRig world={viewed} selected={selected} />
    </Canvas>
  );
}
