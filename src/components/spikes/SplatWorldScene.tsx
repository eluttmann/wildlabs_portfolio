"use client";

import { useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { SparkRenderer, SplatFileType, SplatMesh } from "@sparkjsdev/spark";
import { Vector3, type Group } from "three";
import { projectBySlug } from "@/content/projects";
import { color } from "@/design/tokens";
import { Orb } from "@/components/lab/Orb";
import type { SplatRes, SplatWorld } from "./worlds";

export type WorldStatus = "loading" | "ready" | "error";

interface SceneProps {
  world: SplatWorld;
  res: SplatRes;
  onStatus: (status: WorldStatus) => void;
}

const RESOLUTIONS: SplatRes[] = ["100k", "500k", "full_res"];

/** Plan budget: about 500K splats on phones, full resolution on desktop. `?res=` overrides. */
function pickRes(): SplatRes {
  const asked = new URLSearchParams(window.location.search).get("res");
  if (RESOLUTIONS.includes(asked as SplatRes)) return asked as SplatRes;
  return window.matchMedia("(max-width: 767px)").matches ? "500k" : "full_res";
}

function splatUrl(world: SplatWorld, res: SplatRes) {
  return process.env.NODE_ENV === "development" ? `/spikes/splats/${world.id}/${res}.spz` : world.spz[res];
}

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
 */
function Splats({ world, res, orbs, onStatus }: SceneProps & { orbs: RefObject<Group | null> }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const spark = useMemo(() => new SparkRenderer({ renderer: gl, onDirty: () => invalidate() }), [gl, invalidate]);
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
        const envMap = await spark.renderEnvMap({
          scene,
          worldCenter: orbCentroid(world),
          hideObjects: orbs.current ? [orbs.current] : [],
          update: true,
        });
        if (cancelled) return;
        scene.environment = envMap;
        scene.background = envMap;
        onStatus("ready");
      })
      .catch(() => !cancelled && onStatus("error"));
    return () => {
      cancelled = true;
      mesh.dispose();
    };
  }, [mesh, spark, scene, world, orbs, onStatus]);

  return (
    <>
      <primitive object={spark} />
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

  // Splat worlds hold up near where the source photo was taken; keep the viewer close to it.
  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.7}
      minDistance={1}
      maxDistance={14}
      minPolarAngle={Math.PI * 0.3}
      maxPolarAngle={Math.PI * 0.56}
    />
  );
}

export default function SplatWorldScene({ world, onStatus }: Omit<SceneProps, "res">) {
  const orbs = useRef<Group>(null);
  const [res] = useState(pickRes);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Canvas
      dpr={[1, 2]}
      // Spark recommends no MSAA: it doesn't improve splats and costs a lot of fill rate.
      gl={{ antialias: false }}
      camera={{ position: world.camera.position, fov: 55, near: 0.05, far: 2000 }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={[color.gallery]} />
      <ambientLight intensity={0.4} />

      <Splats world={world} res={res} orbs={orbs} onStatus={onStatus} />

      <group ref={orbs}>
        {world.orbs.map((o, i) => {
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
      </group>

      <CameraRig world={world} selected={selected} />
    </Canvas>
  );
}
