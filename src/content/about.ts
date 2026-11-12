/**
 * The About page, carried over word for word from the Framer site (www.ericluttmann.com/about) on Nov 12, when the
 * domain moved to this site.
 */
export const about = {
  name: "Eric Luttmann",
  intro: "Hi I'm Eric, I build AI & 3D products to enable access to knowledge & creation.",
  approach:
    "I bring a human-centric approach from being a founder, product manager, designer, iOS engineer, architectural engineer and pro musician.",
  projectsLabel: "Fun projects",
  projects: [
    "Led product & design for LLM web app enabling access to decades of spatial data for customers like Stanford University, State of Hawaii",
    "Designed future-of-work AI app to execute processes in minutes rather than days",
    "Founded Ombi, a video digital twin startup to feel interior experiences",
    "Led product for a 3D app to order buildings (keynote at Autodesk University)",
    "Advised at Stanford University on 3D workflows",
    "Founded a nationally touring indie band that plays with Caamp, Sublime, Dispatch",
    "Published a guide on collaborative telepresence for a $10M U.S Dept of Energy project",
    "Built VR models for architectural walkthroughs on $300M buildings",
  ],
  links: [
    { label: "Email", href: "mailto:ericluttmann3@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/luttmann/" },
    { label: "Instagram", href: "https://www.instagram.com/eric_luttmann" },
    { label: "Twitter", href: "https://twitter.com/ericluttmann" },
  ],
  portrait: {
    src: "/about/eric.webp",
    alt: "Eric in a wetsuit, waving from the water beside his surfboard",
    width: 1187,
    height: 1200,
  },
} as const;
