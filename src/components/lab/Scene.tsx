"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Fog, Vector3 } from "three";
import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { projects } from "@/content/projects";
import type { Guide, LayoutId, LayoutResult } from "@/lab/layouts";
import { color } from "@/design/tokens";
import { Orb } from "./Orb";
import { Guides } from "./Guides";

interface SceneProps {
  layoutId: LayoutId;
  layout: LayoutResult;
  guideSets: { id: LayoutId; guides: Guide[] }[];
  selected: string | null;
  matches: Set<string> | null;
  onSelect: (slug: string | null) => void;
}

/** Layout cameras are authored for a 16:10 screen; narrower screens pull back so the structure still fits. */
const AUTHORED_ASPECT = 1.6;

function CameraRig({ layout, selected }: Pick<SceneProps, "layout" | "selected">) {
  const controls = useRef<ComponentRef<typeof CameraControls>>(null);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (selected && layout.positions[selected]) {
      const [x, y, z] = layout.positions[selected];
      // Approach from the layout camera's side so the move reads as a push-in.
      const [cx, cy, cz] = layout.camera.position;
      const dx = cx - x, dy = cy - y, dz = cz - z;
      const len = Math.hypot(dx, dy, dz) || 1;
      const d = 3.2;
      void c.setLookAt(x + (dx / len) * d, y + (dy / len) * d * 0.6 + 0.4, z + (dz / len) * d, x, y, z, true);
    } else {
      const k = Math.min(2.4, Math.max(1, AUTHORED_ASPECT / aspect));
      const [px, py, pz] = layout.camera.position;
      const [tx, ty, tz] = layout.camera.target;
      void c.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, true);
    }
  }, [layout, selected, aspect]);

  // Fog follows the camera's distance to its target, so depth reads the same at every zoom level.
  const target = useRef(new Vector3());
  useFrame(({ camera, scene }) => {
    const c = controls.current;
    if (!c || !(scene.fog instanceof Fog)) return;
    c.getTarget(target.current);
    const d = camera.position.distanceTo(target.current);
    scene.fog.near = d * 0.95;
    scene.fog.far = d * 2.6;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.6}
      minDistance={1.5}
      maxDistance={110}
      maxPolarAngle={Math.PI * 0.52}
    />
  );
}

export default function Scene({ layoutId, layout, guideSets, selected, matches, onSelect }: SceneProps) {
  const faded = new Set(layout.faded ?? []);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 18, 34], fov: 40, near: 0.1, far: 200 }}
      onPointerMissed={() => onSelect(null)}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[color.gallery]} />
      <fog attach="fog" args={[color.gallery, 45, 140]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 12, 8]} intensity={1.2} />

      {/* Studio lighting baked into a cubemap from simple shapes: no HDR download. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 6, -8]} scale={[16, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-8, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[8, 2, 2]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="circle" intensity={2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={6} />
      </Environment>

      {guideSets.map((set) => (
        <Guides key={set.id} guides={set.guides} visible={set.id === layoutId} />
      ))}

      {projects.map((p, i) => (
        <Orb
          key={p.slug}
          project={p}
          target={layout.positions[p.slug] ?? [0, 0, 0]}
          size={layout.sizes[p.slug] ?? 0.4}
          dimmed={faded.has(p.slug) || (!!matches && matches.size > 0 && !matches.has(p.slug))}
          selected={selected === p.slug}
          emphasized={!!matches?.has(p.slug)}
          phase={i * 1.7}
          onSelect={onSelect}
        />
      ))}

      <ContactShadows position={[0, -1.25, 0]} scale={60} blur={2.6} opacity={0.35} far={6} resolution={1024} color={color.ink} />

      <CameraRig layout={layout} selected={selected} />
    </Canvas>
  );
}
