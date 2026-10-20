"use client";

import { Html, Line } from "@react-three/drei";
import type { Guide, Vec3 } from "@/lab/layouts";
import { color } from "@/design/tokens";

function ring(radius: number, y: number): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push([Math.cos(a) * radius, y, Math.sin(a) * radius]);
  }
  return pts;
}

/**
 * Thin structural drawing for each layout: rings, axes, strands and labels.
 * Every layout's guides stay mounted and fade with `visible`: unmounting drei <Html> mid-render
 * throws a removeChild error under React 19.
 */
export function Guides({ guides, visible }: { guides: Guide[]; visible: boolean }) {
  const o = visible ? 1 : 0;
  return (
    <group visible={visible}>
      {guides.map((g, i) => {
        switch (g.kind) {
          case "ring":
            return <Line key={i} points={ring(g.radius, g.y)} color={color.ink3} lineWidth={1} transparent opacity={0.45 * o} />;
          case "line":
            return <Line key={i} points={g.points} color={color.ink3} lineWidth={1} transparent opacity={0.55 * o} />;
          case "sphere":
            return (
              <mesh key={i}>
                <sphereGeometry args={[g.radius, 28, 14]} />
                <meshBasicMaterial wireframe color={color.ink3} transparent opacity={0.14} />
              </mesh>
            );
          case "core":
            return (
              <group key={i} position={g.position}>
                <mesh>
                  <sphereGeometry args={[0.18, 32, 32]} />
                  <meshBasicMaterial color={color.ink} />
                </mesh>
                <Html center position={[0, -0.5, 0]} style={{ pointerEvents: "none", opacity: o, transition: "opacity .5s" }}>
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink">“{g.label}”</span>
                </Html>
              </group>
            );
          case "label":
            return (
              <Html key={i} center position={g.position} style={{ pointerEvents: "none", opacity: o, transition: "opacity .5s" }} zIndexRange={[5, 0]}>
                <span
                  className={`whitespace-nowrap text-[10px] uppercase tracking-[0.18em] ${
                    g.tone === "strong" ? "font-medium text-ink" : "text-ink-3"
                  }`}
                >
                  {g.text}
                </span>
              </Html>
            );
        }
      })}
    </group>
  );
}
