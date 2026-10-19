"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import type { Project } from "@/content/projects";
import type { Vec3 } from "@/lab/layouts";
import { regionColor } from "@/design/tokens";

interface OrbProps {
  project: Project;
  target: Vec3;
  size: number;
  dimmed: boolean;
  selected: boolean;
  /** Matches the current question. */
  emphasized: boolean;
  phase: number;
  onSelect: (slug: string) => void;
}

/** A glass droplet: water-like refraction around a flat Kelly-colour core. */
export function Orb({ project, target, size, dimmed, selected, emphasized, phase, onSelect }: OrbProps) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = regionColor[project.region];
  // On phones, labels pile up; show them only for the orb in focus or matching a question.
  const compact = useThree((s) => s.size.width < 640);
  const showLabel = !compact || hovered || selected || emphasized;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 0.7 + phase) * 0.08;
    g.position.x = MathUtils.damp(g.position.x, target[0], 3, dt);
    g.position.y = MathUtils.damp(g.position.y, target[1] + bob, 3, dt);
    g.position.z = MathUtils.damp(g.position.z, target[2], 3, dt);
    const s = size * (hovered || selected ? 1.12 : 1);
    g.scale.setScalar(MathUtils.damp(g.scale.x, s, 6, dt));
    if (core.current) {
      const c = dimmed ? 0.12 : 0.42;
      core.current.scale.setScalar(MathUtils.damp(core.current.scale.x, c, 5, dt));
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project.slug);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.4}
          roughness={0.06}
          ior={1.33}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor={color}
          attenuationDistance={dimmed ? 12 : 3}
          color="#ffffff"
        />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html center position={[0, -1.45, 0]} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
        <div
          className="whitespace-nowrap text-center transition-opacity duration-500"
          style={{ opacity: showLabel ? (dimmed ? 0.25 : 1) : 0 }}
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink">{project.title}</div>
          {(hovered || selected) && (
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-ink-3">{project.role}</div>
          )}
        </div>
      </Html>
    </group>
  );
}
