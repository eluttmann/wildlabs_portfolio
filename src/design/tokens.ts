/**
 * Design tokens shared by the DOM (mirrored in globals.css) and the 3D scene.
 * Palette direction: Ellsworth Kelly colour fields on a cool gallery white.
 * One colour per region; everything else stays neutral.
 */
import type { Region } from "@/content/projects";

export const color = {
  gallery: "#F3F3F1",
  galleryShade: "#E4E5E3",
  ink: "#111111",
  ink2: "#5B5D60",
  ink3: "#9A9C9F",
  line: "#D3D4D2",
  // 2D gallery (the home page): pure white page, Framer-site text greys and link blue.
  paper: "#FFFFFF",
  inkSoft: "#333333",
  inkMuted: "#86868B",
  link: "#0099FF",
  // Glossy white controls: knurled chrome rim, white gloss face.
  chromeLight: "#F7F7F8",
  chromeDark: "#D6D7DA",
  glossHi: "#FFFFFF",
  glossLo: "#ECECEF",
} as const;

export const regionColor: Record<Region, string> = {
  buildings: "#D63A2F", // Kelly red
  applications: "#F0BE2A", // Kelly yellow
  infra: "#1F4E9E", // Kelly blue
};

export const font = {
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as const;
