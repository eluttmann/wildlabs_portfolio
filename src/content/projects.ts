/**
 * Single content source for both the 2D gallery and the 3D world.
 * Facts come from ericluttmann.com. Anything marked `confirmed: false` is a placeholder to verify.
 */

import type { CaseStudy } from "@/content/case-study";
import { autoprospector } from "@/content/case-studies/autoprospector";
import { dbcApp } from "@/content/case-studies/dbc-app";
import { ombi } from "@/content/case-studies/ombi";
import { vrDesignReviews } from "@/content/case-studies/vr-design-reviews";

export type Region = "buildings" | "applications" | "infra";

/** Powers of Ten ladder, smallest to largest. */
export const SCALES = ["room", "building", "home", "planet", "minds", "audience"] as const;
export type Scale = (typeof SCALES)[number];

export type Strand = "spatial" | "ai";
export type Role = "product" | "design" | "engineering" | "brand";

export interface ProjectLocation {
  lat: number;
  lon: number;
  label: string;
  confirmed: boolean;
}

export interface Project {
  slug: string;
  title: string;
  org: string;
  role: string;
  summary: string;
  url?: string;
  region: Region;
  scale: Scale;
  /** Approximate order in time, 0 = earliest. The current site lists no dates. */
  order: number;
  strand: Strand;
  /** Primary role first. */
  roles: Role[];
  founder?: boolean;
  /** Thesis field: -1 spatial … 1 AI, and -1 creation … 1 knowledge. */
  thesis: { spatialToAI: number; creationToKnowledge: number };
  location: ProjectLocation;
  keywords: string[];
  /** How the project hangs in the 2D gallery (the home page). */
  exhibit?: Exhibit;
  /** Long-form project page; its gallery exhibit links there. */
  caseStudy?: CaseStudy;
}

/** Media sizes are the desktop display size in CSS px; smaller screens scale them down. */
export type ExhibitMedia =
  | { kind: "image"; src: string; alt: string; width: number; height: number; radius?: number }
  | { kind: "video"; src: string; poster: string; alt: string; width: number; height: number };

/**
 * A wall label and its object in the 2D gallery. Copy follows the Framer site (ericluttmann.com),
 * so `title` can differ from the project's own (e.g. "LangChain" for LangGraph Studio).
 */
export interface Exhibit {
  title: string;
  description: string;
  /** Turns the first occurrence of `text` inside the description into a link. */
  descriptionLink?: { text: string; href: string };
  credits: string;
  href?: string;
  media: ExhibitMedia;
}

export const REGIONS: Record<Region, { label: string }> = {
  buildings: { label: "Buildings" },
  applications: { label: "Applications" },
  infra: { label: "Infra" },
};

export const SCALE_LABELS: Record<Scale, string> = {
  room: "Room",
  building: "Building",
  home: "Home",
  planet: "Planet",
  minds: "Minds",
  audience: "Audience",
};

export const projects: Project[] = [
  {
    slug: "immersive-workspaces",
    title: "Immersive Workspaces",
    org: "Department of Energy project",
    role: "VR Research Assistant",
    summary: "A $10M interactive workspace and video conference project.",
    url: "https://bim.psu.edu/interactive_workspaces/",
    region: "buildings",
    scale: "room",
    order: 0,
    strand: "spatial",
    roles: ["engineering", "design"],
    thesis: { spatialToAI: -0.85, creationToKnowledge: -0.2 },
    location: { lat: 40.79, lon: -77.86, label: "State College, PA", confirmed: true },
    keywords: ["vr", "virtual-reality", "research", "workspace", "immersive", "spatial", "3d", "collaboration"],
    exhibit: {
      title: "Immersive Workspaces",
      description: "$10M interactive workspace & video conference project - Dept of Energy",
      credits: "VR Research Assistant",
      href: "https://bim.psu.edu/interactive_workspaces/",
      media: {
        kind: "image",
        src: "/exhibits/immersive-workspaces.webp",
        alt: "An immersive workspace with wall-sized displays",
        width: 534,
        height: 406,
        radius: 12,
      },
    },
  },
  {
    slug: "vr-design-reviews",
    title: "VR Design Reviews",
    org: "Architecture & construction",
    role: "XR Engineer · 3D Design Management",
    summary: "Spatial prototyping on $300M buildings.",
    url: "https://www.2d.ericluttmann.com/vr/",
    caseStudy: vrDesignReviews,
    region: "buildings",
    scale: "building",
    order: 1,
    strand: "spatial",
    roles: ["engineering", "product"],
    thesis: { spatialToAI: -0.75, creationToKnowledge: -0.6 },
    location: { lat: 39.95, lon: -75.17, label: "Placeholder", confirmed: false },
    keywords: ["vr", "xr", "spatial", "prototyping", "building", "architecture", "construction", "3d"],
    exhibit: {
      title: "VR Design Reviews",
      description: "Spatial prototyping on $300M buildings",
      credits: "XR Engineer / 3D Design Mgmt",
      media: {
        kind: "image",
        src: "/exhibits/vr-design-reviews.webp",
        alt: "A design review in a VR headset in front of a building model",
        width: 354,
        height: 431,
        radius: 24,
      },
    },
  },
  {
    slug: "dbc-app",
    title: "DBC App",
    org: "Buildings from 3D",
    role: "Product Management & Design",
    summary: "Ordering buildings from 3D models.",
    url: "https://www.2d.ericluttmann.com/dbc/",
    caseStudy: dbcApp,
    region: "buildings",
    scale: "building",
    order: 2,
    strand: "spatial",
    roles: ["product", "design"],
    thesis: { spatialToAI: -0.55, creationToKnowledge: -0.75 },
    location: { lat: 37.8, lon: -122.27, label: "Placeholder", confirmed: false },
    keywords: ["building", "3d", "model", "construction", "ordering", "product", "spatial", "architecture"],
    exhibit: {
      title: "DBC App",
      description: "Order buildings from 3D models",
      credits: "Product Mgmt & Design",
      media: {
        kind: "image",
        src: "/exhibits/dbc-app.webp",
        alt: "The DBC App on a tablet, showing a 3D building model",
        width: 534,
        height: 406,
      },
    },
  },
  {
    slug: "millennial-entertainment",
    title: "Millennial Entertainment",
    org: "Millennial Entertainment",
    role: "Visual & Brand Design",
    summary: "Brand, website and video reaching more than 100 million combined monthly viewers.",
    url: "https://www.millentertainment.com/",
    region: "applications",
    scale: "audience",
    order: 3,
    strand: "ai",
    roles: ["brand", "design"],
    thesis: { spatialToAI: 0.2, creationToKnowledge: -0.9 },
    location: { lat: 34.02, lon: -118.45, label: "Placeholder", confirmed: false },
    keywords: ["brand", "visual", "identity", "website", "video", "media", "audience", "entertainment"],
    exhibit: {
      title: "Millennial Entertainment",
      // Framer reads "100 Million+"; reworded because figures never carry a "+" in UI copy.
      description: "More than 100 million combined monthly viewers",
      credits: "Visual & Brand Design | website & video",
      href: "https://www.millentertainment.com/",
      media: {
        kind: "video",
        src: "/exhibits/millennial.mp4",
        poster: "/exhibits/millennial-poster.webp",
        alt: "Millennial Entertainment sizzle reel on a phone",
        width: 291,
        height: 632,
      },
    },
  },
  {
    slug: "ombi",
    title: "Ombi",
    org: "Founder",
    role: "Founder | Product, design, eng, GTM",
    summary: "Previews experiences through video.",
    url: "https://www.2d.ericluttmann.com/ombi/",
    caseStudy: ombi,
    region: "applications",
    scale: "audience",
    order: 4,
    strand: "ai",
    founder: true,
    roles: ["product", "design", "brand"],
    thesis: { spatialToAI: -0.1, creationToKnowledge: -0.45 },
    location: { lat: 37.76, lon: -122.42, label: "Placeholder", confirmed: false },
    keywords: ["video", "preview", "experience", "founder", "startup", "media", "go-to-market"],
    exhibit: {
      title: "Ombi",
      description: "Preview experiences through video",
      credits: "Founder | Product, design, eng, GTM",
      media: {
        kind: "video",
        src: "/exhibits/ombi.mp4",
        poster: "/exhibits/ombi-poster.webp",
        alt: "The Ombi app on a phone, previewing places through video",
        width: 362,
        height: 704,
      },
    },
  },
  {
    slug: "autoprospector",
    title: "AutoProspector",
    org: "Founding team",
    role: "Founding Product Designer",
    summary: "Knowledge work in minutes instead of days, with AI.",
    url: "https://www.2d.ericluttmann.com/autoprospector/",
    caseStudy: autoprospector,
    region: "infra",
    scale: "minds",
    order: 5,
    strand: "ai",
    roles: ["design", "product"],
    thesis: { spatialToAI: 0.8, creationToKnowledge: 0.7 },
    location: { lat: 37.79, lon: -122.4, label: "Placeholder", confirmed: false },
    keywords: ["ai", "knowledge", "research", "agent", "automation", "founding", "startup", "tool"],
    exhibit: {
      title: "AutoProspector",
      description: "Do knowledge work in minutes rather than days with AI",
      credits: "Founding Product Designer",
      media: {
        kind: "image",
        src: "/exhibits/autoprospector.webp",
        alt: "AutoProspector on a laptop",
        width: 640,
        height: 444,
      },
    },
  },
  {
    slug: "langgraph-studio",
    title: "LangGraph Studio",
    org: "LangChain",
    role: "Product Design",
    summary: "A visual agent development tool used by Apple, Visa, Uber, Replit and LinkedIn.",
    url: "https://www.youtube.com/watch?v=Mi1gSlHwZLM&t=1s",
    region: "infra",
    scale: "minds",
    order: 6,
    strand: "ai",
    roles: ["design"],
    thesis: { spatialToAI: 0.9, creationToKnowledge: 0.1 },
    location: { lat: 37.78, lon: -122.39, label: "San Francisco", confirmed: true },
    keywords: ["ai", "agent", "developer", "tool", "visual", "graph", "langchain", "enterprise"],
    exhibit: {
      title: "LangChain",
      description: "LangGraph Studio is a visual agent development tool used by Apple, Visa, Uber, Replit, LinkedIn.",
      descriptionLink: { text: "LangGraph Studio", href: "https://www.youtube.com/watch?v=Mi1gSlHwZLM&t=1s" },
      credits: "Product Design",
      href: "https://www.youtube.com/watch?v=Mi1gSlHwZLM&t=1s",
      media: {
        kind: "image",
        src: "/exhibits/langchain.webp",
        alt: "LangGraph Studio on a laptop",
        width: 640,
        height: 444,
      },
    },
  },
  {
    slug: "marble",
    title: "Marble",
    org: "Geospatial AI",
    role: "Product Design & Management",
    summary: "A geospatial AI web app giving institutions access to decades of spatial data.",
    region: "applications",
    scale: "planet",
    order: 7,
    strand: "spatial",
    roles: ["product", "design"],
    thesis: { spatialToAI: 0.1, creationToKnowledge: 0.9 },
    location: { lat: 38.9, lon: -77.04, label: "Placeholder", confirmed: false },
    keywords: ["geospatial", "ai", "map", "earth", "satellite", "spatial", "data", "planet"],
    exhibit: {
      title: "Marble",
      description: "Geospatial AI web-app that lets institutions access decades of spatial data to improve place performance.",
      credits: "Product Design & Mgmt",
      media: {
        kind: "image",
        src: "/exhibits/marble.webp",
        alt: "Marble on a laptop, showing an aerial map",
        width: 640,
        height: 444,
      },
    },
  },
  {
    slug: "pillar",
    title: "Pillar",
    org: "Founder",
    role: "Founding Product Builder",
    summary: "Spatial AI that helps homeowners get insurance in fire risk areas.",
    url: "https://buildwithpillar.com/",
    region: "applications",
    scale: "home",
    order: 8,
    strand: "spatial",
    founder: true,
    roles: ["product", "design", "engineering"],
    thesis: { spatialToAI: 0.0, creationToKnowledge: 0.45 },
    location: { lat: 34.05, lon: -118.53, label: "Los Angeles", confirmed: true },
    keywords: ["spatial", "ai", "home", "insurance", "wildfire", "founder", "geospatial", "property"],
    exhibit: {
      title: "Pillar",
      description: "Spatial AI to help homeowners get insurance in fire risk areas",
      credits: "Founding Product Builder",
      href: "https://buildwithpillar.com/",
      media: {
        kind: "image",
        src: "/exhibits/pillar.webp",
        alt: "Pillar on a laptop, showing a home and its wildfire walkthrough",
        width: 640,
        height: 444,
      },
    },
  },
];

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<string, Project>;

/** Hanging order of the 2D gallery, as on the Framer site: newest work first. */
export const GALLERY_ORDER = [
  "pillar",
  "langgraph-studio",
  "marble",
  "ombi",
  "autoprospector",
  "dbc-app",
  "millennial-entertainment",
  "vr-design-reviews",
  "immersive-workspaces",
] as const;

export type CaseStudyProject = Project & { caseStudy: CaseStudy };

/** Projects that have a long-form page, in gallery order (drives prev and next links). */
export const caseStudyProjects: CaseStudyProject[] = GALLERY_ORDER.map((slug) => projectBySlug[slug]).filter(
  (p): p is CaseStudyProject => Boolean(p?.caseStudy),
);

export function caseStudyByPath(path: string): CaseStudyProject {
  const project = caseStudyProjects.find((p) => p.caseStudy.path === path);
  if (!project) throw new Error(`No case study at /${path}`);
  return project;
}
