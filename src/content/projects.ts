/**
 * Single content source for both the 2D gallery and the 3D world.
 * Facts come from ericluttmann.com. Anything marked `confirmed: false` is a placeholder to verify.
 */

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
  },
  {
    slug: "vr-design-reviews",
    title: "VR Design Reviews",
    org: "Architecture & construction",
    role: "XR Engineer · 3D Design Management",
    summary: "Spatial prototyping on $300M buildings.",
    url: "https://www.2d.ericluttmann.com/vr/",
    region: "buildings",
    scale: "building",
    order: 1,
    strand: "spatial",
    roles: ["engineering", "product"],
    thesis: { spatialToAI: -0.75, creationToKnowledge: -0.6 },
    location: { lat: 39.95, lon: -75.17, label: "Placeholder", confirmed: false },
    keywords: ["vr", "xr", "spatial", "prototyping", "building", "architecture", "construction", "3d"],
  },
  {
    slug: "dbc-app",
    title: "DBC App",
    org: "Buildings from 3D",
    role: "Product Management & Design",
    summary: "Ordering buildings from 3D models.",
    url: "https://www.2d.ericluttmann.com/dbc/",
    region: "buildings",
    scale: "building",
    order: 2,
    strand: "spatial",
    roles: ["product", "design"],
    thesis: { spatialToAI: -0.55, creationToKnowledge: -0.75 },
    location: { lat: 37.8, lon: -122.27, label: "Placeholder", confirmed: false },
    keywords: ["building", "3d", "model", "construction", "ordering", "product", "spatial", "architecture"],
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
  },
  {
    slug: "ombi",
    title: "Ombi",
    org: "Founder",
    role: "Product · Design · Go-to-market",
    summary: "Previews experiences through video.",
    url: "https://www.2d.ericluttmann.com/ombi/",
    region: "applications",
    scale: "audience",
    order: 4,
    strand: "ai",
    founder: true,
    roles: ["product", "design", "brand"],
    thesis: { spatialToAI: -0.1, creationToKnowledge: -0.45 },
    location: { lat: 37.76, lon: -122.42, label: "Placeholder", confirmed: false },
    keywords: ["video", "preview", "experience", "founder", "startup", "media", "go-to-market"],
  },
  {
    slug: "autoprospector",
    title: "AutoProspector",
    org: "Founding team",
    role: "Founding Product Designer",
    summary: "Knowledge work in minutes instead of days, with AI.",
    url: "https://www.2d.ericluttmann.com/autoprospector/",
    region: "infra",
    scale: "minds",
    order: 5,
    strand: "ai",
    roles: ["design", "product"],
    thesis: { spatialToAI: 0.8, creationToKnowledge: 0.7 },
    location: { lat: 37.79, lon: -122.4, label: "Placeholder", confirmed: false },
    keywords: ["ai", "knowledge", "research", "agent", "automation", "founding", "startup", "tool"],
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
  },
  {
    slug: "pillar",
    title: "Pillar",
    org: "Founder",
    role: "Product · Design · Engineering",
    summary: "Spatial AI that helps LA homeowners get insurance after the fires.",
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
  },
];

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<string, Project>;
