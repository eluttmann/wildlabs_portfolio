"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
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
  Box3,
  EquirectangularReflectionMapping,
  MathUtils,
  NoToneMapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";
import { projectBySlug } from "@/content/projects";
import type { Vec3 } from "@/lab/layouts";
import { ProjectCard } from "./ProjectCard";
import type { SplatRes, SplatWorld } from "./worlds";

export type WorldStatus = "loading" | "ready" | "error";

interface SceneProps {
  world: SplatWorld;
  res: SplatRes;
  onStatus: (status: WorldStatus) => void;
}

export interface SplatWorldSceneProps {
  world: SplatWorld;
  onStatus: (status: WorldStatus) => void;
  /** The card the camera is flying to, or null to walk. */
  selected: string | null;
  onSelect: (slug: string) => void;
  /** The camera reached the selected card. */
  onArrive: (slug: string) => void;
  /** Bumped to fly the camera back to the starting viewpoint (the logo in the 3D top bar). */
  resetSignal: number;
  /** Called once, the first time the view leaves the starting viewpoint (turning, walking or opening a card). */
  onMoved: () => void;
}

const RESOLUTIONS: SplatRes[] = ["100k", "150k", "500k", "full_res"];

/**
 * Plan budget: the first frame comes from 500K splats (about 8 MB); desktops then upgrade to full resolution (about
 * 70 MB) in place, phones stay at 500K. `?res=` pins one resolution.
 */
function pickRes(): { first: SplatRes; final: SplatRes } {
  const asked = new URLSearchParams(window.location.search).get("res");
  if (RESOLUTIONS.includes(asked as SplatRes)) return { first: asked as SplatRes, final: asked as SplatRes };
  return { first: "500k", final: window.matchMedia("(max-width: 767px)").matches ? "500k" : "full_res" };
}

function makeMesh(url: string, world: SplatWorld) {
  const m = new SplatMesh({ url, fileType: SplatFileType.SPZ });
  m.quaternion.set(1, 0, 0, 0);
  m.scale.setScalar(world.metricScale);
  m.position.set(0, world.groundOffset, 0);
  return m;
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
    // 60° (was 55° until Nov 12): a touch wider, so the arrival frame holds the headline above the cards.
    fov: num("fov", 60),
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
  // By default the gaze is about level (1° up; it was 2° down until Nov 12): the cards and horizon sit lower in the
  // frame, leaving sky for the arrival headline and less of the speckled ground underfoot.
  const rise = params.has("pitch") ? Math.tan((Number(params.get("pitch")) * Math.PI) / 180) * 10 : 0.2;
  return { position: eye, target: [eye[0] - Math.sin(yaw) * 10, eyeY + rise, eye[2] - Math.cos(yaw) * 10] };
}

function splatUrl(world: SplatWorld, res: SplatRes) {
  return process.env.NODE_ENV === "development" ? `/spikes/splats/${world.id}/${res}.spz` : world.spz[res];
}

/** The world's sharp backdrop panorama: a hosted URL everywhere, or a local file in development only. */
function backdropUrl(world: SplatWorld) {
  if (!world.backdrop) return null;
  if (/^https:\/\//.test(world.backdrop)) return world.backdrop;
  return process.env.NODE_ENV === "development" ? `/spikes/splats/${world.id}/${world.backdrop}` : null;
}

const nextFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const tick = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => tick(left - 1)));
    tick(n);
  });

/** The environment map is rendered from the cards' centroid, which sits near the capture point. */
function cardCentroid(world: SplatWorld) {
  const c = new Vector3();
  for (const o of world.cards) c.add(new Vector3(...o.position));
  return c.divideScalar(Math.max(1, world.cards.length));
}

/**
 * The Marble world as Gaussian splats. Marble SPZ files are OpenCV-framed (y down) in raw units:
 * rotate 180° about X, scale to metres, and lift by the ground offset so the meadow sits at y = 0.
 * Once loaded, the splats are rendered into an environment map so the glass cards reflect the valley.
 * The cards mount only after that, so they never appear in their own reflections.
 */
function Splats({ world, res, upgrade, look, onStatus }: SceneProps & { upgrade: SplatRes; look: Look }) {
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
  const mesh = useMemo(() => (url ? makeMesh(url, world) : null), [url, world]);
  const [shown, setShown] = useState(false);

  // Once the first resolution is on screen, load the final one hidden beside it and swap in a single frame.
  const upgradeUrl = upgrade !== res ? splatUrl(world, upgrade) : undefined;
  const full = useMemo(() => {
    if (!shown || !upgradeUrl) return null;
    const m = makeMesh(upgradeUrl, world);
    m.visible = false;
    return m;
  }, [shown, upgradeUrl, world]);

  useEffect(() => {
    if (!full || !mesh) return;
    let cancelled = false;
    full.initialized
      .then(async () => {
        await nextFrames(10);
        if (cancelled) return;
        full.visible = true;
        mesh.visible = false;
        invalidate();
      })
      .catch(() => {}); // Keep the first resolution if the upgrade fails.
    return () => {
      cancelled = true;
      full.dispose();
    };
  }, [full, mesh, invalidate]);

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
          worldCenter: cardCentroid(world),
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
        setShown(true);
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
      {full && <primitive object={full} />}
    </>
  );
}

/** First person: the orbit target sits this far ahead of the eye, so dragging turns the head in place. */
const LOOK = 0.01;
const WALK_SPEED = 1.6; // metres per second, an easy stroll
const TURN_SPEED = 1.4; // radians per second for the arrow keys
const WALK_SMOOTH = 0.7;
const FLY_SMOOTH = 1.1; // the slower, theatrical move up to a card
/** How far in front of a card the camera stops, in metres. */
const CARD_STAND = 1.75;

const MOVE_KEYS: Record<string, [forward: number, side: number, turn: number]> = {
  KeyW: [1, 0, 0],
  ArrowUp: [1, 0, 0],
  KeyS: [-1, 0, 0],
  ArrowDown: [-1, 0, 0],
  KeyA: [0, -1, 0],
  KeyD: [0, 1, 0],
  ArrowLeft: [0, 0, 1],
  ArrowRight: [0, 0, -1],
};

const tmpPos = new Vector3();
const tmpTarget = new Vector3();

/** The horizontal direction the camera faces, or null before the controls exist. */
function facing(c: CameraControlsImpl | null) {
  if (!c) return null;
  c.getPosition(tmpPos);
  c.getTarget(tmpTarget);
  const f = tmpTarget.sub(tmpPos).setY(0);
  return f.lengthSq() > 0 ? f.normalize() : null;
}

/**
 * The visitor walks: drag to look around, W A S D or the arrow keys (or a trackpad scroll) to move, tap the meadow to
 * walk there. Splat worlds hold up only near where the photo was taken, so walking stays inside `walkRadius`. Picking a
 * card flies the camera up to it; deselecting flies back to where the visitor stood.
 */
function CameraRig({
  world,
  start,
  selected,
  onArrive,
  resetSignal,
  onMoved,
}: {
  world: SplatWorld;
  start: SplatWorld["camera"];
  selected: string | null;
  onArrive: (slug: string) => void;
  resetSignal: number;
  onMoved: () => void;
}) {
  const moved = useRef(false);
  const startEye = useMemo(() => new Vector3(...start.position), [start]);
  const startDir = useMemo(
    () => new Vector3(...start.target).sub(new Vector3(...start.position)).setY(0).normalize(),
    [start],
  );
  const controls = useRef<CameraControlsImpl>(null);
  const gl = useThree((s) => s.gl);
  const keys = useRef(new Set<string>());
  const home = useRef<{ position: Vector3; target: Vector3 } | null>(null);
  const flying = useRef(false);
  /**
   * Where a flight ends. camera-controls only reports "rest" once motion is below a hair, seconds after the move looks
   * finished, so arrival is judged by distance instead: the project opens as the camera reaches the card.
   */
  const goal = useRef<{ position: Vector3; slug: string | null } | null>(null);
  const radius = world.walkRadius ?? 7;
  // A `?pitch=` review view needs to look straight up or down, past the usual tilt limits.
  const [freeTilt] = useState(() => new URLSearchParams(window.location.search).has("pitch"));
  const walkBounds = useMemo(
    () => new Box3(new Vector3(-radius, -50, -radius), new Vector3(radius, 50, radius)),
    [radius],
  );

  // Stand at the start pose, looking the same way, with the target just ahead of the eye.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const [x, y, z] = start.position;
    const d = new Vector3(...start.target).sub(new Vector3(x, y, z)).normalize().multiplyScalar(LOOK);
    void c.setLookAt(x, y, z, x + d.x, y + d.y, z + d.z, false);
    const { ACTION } = CameraControlsImpl;
    c.mouseButtons.right = ACTION.NONE;
    c.mouseButtons.middle = ACTION.NONE;
    c.mouseButtons.wheel = ACTION.NONE;
    c.touches.two = ACTION.NONE;
    c.touches.three = ACTION.NONE;
    // Negative speeds make a drag pull the view, as in a photo sphere.
    c.azimuthRotateSpeed = -0.35;
    c.polarRotateSpeed = -0.35;
    c.setBoundary(walkBounds);
  }, [start, walkBounds]);

  /** Moves the eye (and the target with it), staying inside the walk radius. */
  const walkBy = useCallback(
    (dx: number, dz: number, smooth: boolean) => {
      const c = controls.current;
      if (!c || flying.current) return;
      c.getTarget(tmpTarget);
      let nx = tmpTarget.x + dx;
      let nz = tmpTarget.z + dz;
      const r = Math.hypot(nx, nz);
      if (r > radius) {
        nx *= radius / r;
        nz *= radius / r;
      }
      void c.moveTo(nx, tmpTarget.y, nz, smooth);
    },
    [radius],
  );

  useEffect(() => {
    const typing = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e) || !(e.code in MOVE_KEYS)) return;
      keys.current.add(e.code);
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    // A trackpad scroll walks forward or back.
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = facing(controls.current);
      if (!f) return;
      const step = MathUtils.clamp(-e.deltaY * 0.004, -0.4, 0.4);
      walkBy(f.x * step, f.z * step, true);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    gl.domElement.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      gl.domElement.removeEventListener("wheel", wheel);
    };
  }, [gl, walkBy]);

  useFrame((_, dt) => {
    const c = controls.current;
    // The first real move away from the start (20 cm, or about 4° of turn) retires the opening headline.
    if (c && !moved.current) {
      const f = facing(c);
      const away = c.getPosition(tmpPos).distanceTo(startEye) > 0.2;
      if (away || (f && f.dot(startDir) < 0.9976)) {
        moved.current = true;
        onMoved();
      }
    }
    const g = goal.current;
    if (c && g && c.getPosition(tmpPos).distanceTo(g.position) < (g.slug ? 0.25 : 0.05)) {
      goal.current = null;
      if (g.slug) {
        onArrive(g.slug);
      } else {
        c.smoothTime = WALK_SMOOTH;
        c.setBoundary(walkBounds);
        flying.current = false;
      }
    }
    if (!c || flying.current || selected || keys.current.size === 0) return;
    let forward = 0;
    let side = 0;
    let turn = 0;
    for (const k of keys.current) {
      const [f, s, t] = MOVE_KEYS[k] ?? [0, 0, 0];
      forward += f;
      side += s;
      turn += t;
    }
    if (turn) void c.rotate(turn * TURN_SPEED * dt, 0, false);
    const f = facing(c);
    if (!f || (!forward && !side)) return;
    const step = WALK_SPEED * Math.min(dt, 0.05);
    // Right of facing is (−z, x).
    walkBy((f.x * forward - f.z * side) * step, (f.z * forward + f.x * side) * step, false);
  });

  // Fly up to the chosen card, then tell the page so it can open the project; fly home when it closes.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const card = selected ? world.cards.find((o) => o.slug === selected) : null;
    if (card && selected) {
      if (!home.current) home.current = { position: c.getPosition(new Vector3()), target: c.getTarget(new Vector3()) };
      flying.current = true;
      keys.current.clear();
      c.setBoundary(); // a card may stand beyond the walk radius
      c.smoothTime = FLY_SMOOTH;
      const [x, y, z] = card.position;
      const from = home.current.position;
      const away = new Vector3(from.x - x, 0, from.z - z);
      if (away.lengthSq() < 1e-6) away.set(0, 0, 1);
      away.normalize().multiplyScalar(CARD_STAND);
      const stand = new Vector3(x + away.x, y, z + away.z);
      goal.current = { position: stand, slug: selected };
      void c.setLookAt(stand.x, stand.y, stand.z, x, y, z, true);
    } else if (!selected && home.current) {
      const back = home.current;
      home.current = null;
      c.smoothTime = FLY_SMOOTH;
      goal.current = { position: back.position, slug: null };
      void c.setLookAt(...back.position.toArray(), ...back.target.toArray(), true);
    }
  }, [selected, world]);

  // Back to the starting viewpoint: the same smooth flight, ending where and how the visitor arrived. Declared after the
  // card flight so it wins when both fire together (closing a project and resetting in one click).
  useEffect(() => {
    const c = controls.current;
    if (!c || !resetSignal) return;
    home.current = null;
    keys.current.clear();
    flying.current = true;
    c.setBoundary();
    c.smoothTime = FLY_SMOOTH;
    const [x, y, z] = start.position;
    const d = new Vector3(...start.target).sub(new Vector3(x, y, z)).normalize().multiplyScalar(LOOK);
    goal.current = { position: new Vector3(x, y, z), slug: null };
    void c.setLookAt(x, y, z, x + d.x, y + d.y, z + d.z, true);
  }, [resetSignal, start]);

  /** Tap the meadow to walk there; a drag to look around doesn't count. */
  const walkTo = (e: ThreeEvent<MouseEvent>) => {
    const c = controls.current;
    if (!c || e.delta > 6 || selected) return;
    c.getPosition(tmpPos);
    walkBy(e.point.x - tmpPos.x, e.point.z - tmpPos.z, true);
  };

  return (
    <>
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={WALK_SMOOTH}
        minDistance={0}
        maxDistance={Infinity}
        dollyToCursor={false}
        enabled={!selected}
        minPolarAngle={freeTilt ? 0.02 : Math.PI * 0.3}
        maxPolarAngle={freeTilt ? Math.PI - 0.02 : Math.PI * 0.64}
      />
      {/* An invisible floor to tap on: it writes no colour or depth, so the splats show through untouched. */}
      <mesh rotation-x={-Math.PI / 2} onClick={walkTo}>
        <circleGeometry args={[radius + 4, 48]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </>
  );
}

export default function SplatWorldScene({
  world,
  onStatus,
  selected,
  onSelect,
  onArrive,
  resetSignal,
  onMoved,
}: SplatWorldSceneProps) {
  const [res] = useState(pickRes);
  const [ready, setReady] = useState(false);
  const report = useCallback(
    (status: WorldStatus) => {
      setReady(status === "ready");
      onStatus(status);
    },
    [onStatus],
  );
  const [look] = useState(pickLook);
  const [camera] = useState(() => pickView(world, look));
  const [lite] = useState(() => window.matchMedia("(max-width: 767px)").matches);

  return (
    <Canvas
      dpr={[1, 2]}
      // Spark recommends no MSAA: it doesn't improve splats and costs a lot of fill rate.
      gl={{ antialias: false, toneMapping: look.tone === "none" ? NoToneMapping : ACESFilmicToneMapping }}
      camera={{ position: camera.position, fov: look.fov, near: 0.05, far: 2000 }}
    >
      {/* No scene background until the world loads: the transparent canvas shows the gallery white behind it. */}
      <ambientLight intensity={0.4} />

      <Splats world={world} res={res.first} upgrade={res.final} look={look} onStatus={report} />

      {ready &&
        world.cards.map((o, i) => {
          const project = projectBySlug[o.slug];
          if (!project) return null;
          return (
            <ProjectCard
              key={o.slug}
              project={project}
              position={o.position}
              selected={selected === o.slug}
              lite={lite}
              phase={i * 1.7}
              onSelect={onSelect}
            />
          );
        })}

      <CameraRig
        world={world}
        start={camera}
        selected={selected}
        onArrive={onArrive}
        resetSignal={resetSignal}
        onMoved={onMoved}
      />
    </Canvas>
  );
}
