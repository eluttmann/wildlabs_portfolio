"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  CanvasTexture,
  ExtrudeGeometry,
  MathUtils,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector3,
  type Group,
} from "three";
import { projectCover, type Project } from "@/content/projects";
import type { Vec3 } from "@/lab/layouts";
import { color, font, regionColor } from "@/design/tokens";

/*
 * A floating glass card, after visionOS windows: a frosted, glossy slab with deep rounded corners, the project's
 * image inset with concentric corners, and its title and role set on the glass below. Sizes are metres.
 */
// Landscape, about 3:2 overall (1.4 × 0.94 m), around a 16:9 image: the shape of screens and video, so product shots
// and project videos fit without heavy cropping.
const WIDTH = 1.4;
const PAD = 0.045;
const IMAGE_W = WIDTH - 2 * PAD;
const IMAGE_H = (IMAGE_W * 9) / 16;
const TEXT_H = 0.16;
const HEIGHT = PAD + IMAGE_H + TEXT_H;
const RADIUS = 0.13; // about a tenth of the width, for deep visionOS-style corners
const IMAGE_RADIUS = RADIUS - PAD; // concentric with the card's corner
const DEPTH = 0.016;
const BEVEL = 0.014;
/** Face texture resolution, in pixels per metre. */
const PX = 1200;

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The glass body: the card outline extruded, with a bevel that rounds its rim. */
function glassGeometry() {
  const g = new ExtrudeGeometry(roundedRect(WIDTH, HEIGHT, RADIUS), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 6,
    curveSegments: 24,
  });
  g.translate(0, 0, -DEPTH / 2);
  return g;
}

/** The front face, with UVs spanning the card so the face texture maps edge to edge. */
function faceGeometry(): ShapeGeometry {
  const g = new ShapeGeometry(roundedRect(WIDTH, HEIGHT, RADIUS), 24);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + WIDTH / 2) / WIDTH, (pos.getY(i) + HEIGHT / 2) / HEIGHT);
  }
  uv.needsUpdate = true;
  return g;
}

/** Every card has the same shape, so the two geometries are built once and shared for the page's lifetime. */
let shared: { glass: ExtrudeGeometry; face: ShapeGeometry } | null = null;
function cardGeometry() {
  shared ??= { glass: glassGeometry(), face: faceGeometry() };
  return shared;
}

/** Tells three.js to re-upload a canvas texture after it was repainted. */
function markDirty(texture: CanvasTexture) {
  texture.needsUpdate = true;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Paints the frost wash, the image (cover-fitted) and the title and role. */
function paintFace(ctx: CanvasRenderingContext2D, project: Project, image: HTMLImageElement | null) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const px = (m: number) => m * PX;
  ctx.clearRect(0, 0, w, h);

  // A milky wash over the whole face keeps the text legible whatever the meadow does behind the glass.
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  roundRectPath(ctx, 0, 0, w, h, px(RADIUS));
  ctx.fill();

  const ix = px(PAD);
  const iy = px(PAD);
  const iw = px(IMAGE_W);
  const ih = px(IMAGE_H);
  ctx.save();
  roundRectPath(ctx, ix, iy, iw, ih, px(IMAGE_RADIUS));
  ctx.clip();
  if (image) {
    const scale = Math.max(iw / image.naturalWidth, ih / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    ctx.drawImage(image, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = color.galleryShade;
    ctx.fillRect(ix, iy, iw, ih);
  }
  ctx.restore();

  const textX = px(PAD + 0.02);
  const titleY = iy + ih + px(0.075);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color.ink;
  ctx.font = `500 ${px(0.058)}px ${font.sans}`;
  ctx.fillText(project.title, textX, titleY, px(IMAGE_W - 0.04));
  ctx.fillStyle = color.ink2;
  ctx.font = `400 ${px(0.042)}px ${font.sans}`;
  ctx.fillText(project.role, textX, titleY + px(0.058), px(IMAGE_W - 0.04));
}

function useFaceTexture(project: Project) {
  const invalidate = useThree((s) => s.invalidate);
  const anisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(WIDTH * PX);
    canvas.height = Math.round(HEIGHT * PX);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, anisotropy);
    return { texture: t, ctx: canvas.getContext("2d") };
  }, [anisotropy]);

  useEffect(() => {
    if (!ctx) return;
    paintFace(ctx, project, null);
    markDirty(texture);
    const cover = projectCover(project);
    if (!cover) return;
    let live = true;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!live) return;
      paintFace(ctx, project, img);
      markDirty(texture);
      invalidate();
    };
    img.src = cover.src;
    return () => {
      live = false;
    };
  }, [ctx, project, texture, invalidate]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

interface ProjectCardProps {
  project: Project;
  position: Vec3;
  selected: boolean;
  /** Phones get a lighter glass: transmission re-renders the splats, which costs too much frame time there. */
  lite: boolean;
  phase: number;
  onSelect: (slug: string) => void;
}

const toCamera = new Vector3();
const local = new Vector3();

export function ProjectCard({ project, position, selected, lite, phase, onSelect }: ProjectCardProps) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const tilt = useRef({ x: 0, y: 0 });
  const { glass, face } = cardGeometry();
  const texture = useFaceTexture(project);
  const tint = regionColor[project.region];

  useFrame((state, dt) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    const t = state.clock.elapsedTime;
    // Float: a slow bob, out of step with the other cards.
    g.position.set(position[0], position[1] + Math.sin(t * 0.6 + phase) * 0.03, position[2]);
    // Turn to face the visitor around the vertical axis only, like a visionOS window.
    toCamera.subVectors(state.camera.position, g.position);
    const yaw = Math.atan2(toCamera.x, toCamera.z);
    let delta = yaw - g.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    g.rotation.y += delta * (1 - Math.exp(-4 * dt));
    // Lean toward the pointer and lift a little on hover.
    b.rotation.x = MathUtils.damp(b.rotation.x, tilt.current.x, 6, dt);
    b.rotation.y = MathUtils.damp(b.rotation.y, tilt.current.y, 6, dt);
    const s = hovered && !selected ? 1.04 : 1;
    b.scale.setScalar(MathUtils.damp(b.scale.x, s, 6, dt));
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const b = body.current;
    if (!b) return;
    b.worldToLocal(local.copy(e.point));
    tilt.current = { x: -(local.y / HEIGHT) * 0.14, y: (local.x / WIDTH) * 0.18 };
  };

  return (
    <group ref={root}>
      <group
        ref={body}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 6) return; // a drag to look around, not a tap
          onSelect(project.slug);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={onMove}
        onPointerOut={() => {
          setHovered(false);
          tilt.current = { x: 0, y: 0 };
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={glass}>
          {lite ? (
            <meshPhysicalMaterial
              color={color.paper}
              transparent
              opacity={0.42}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.05}
              depthWrite={false}
            />
          ) : (
            <meshPhysicalMaterial
              color={color.paper}
              transmission={1}
              roughness={0.32}
              thickness={0.35}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0.05}
              attenuationColor={tint}
              attenuationDistance={4}
              specularIntensity={1}
            />
          )}
        </mesh>
        <mesh geometry={face} position-z={DEPTH / 2 + BEVEL + 0.001}>
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
