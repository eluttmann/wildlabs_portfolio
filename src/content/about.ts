/**
 * The About page copy (Eric, Nov 12). Project lines keep Eric's wording, with the first word capitalised for the list;
 * a project with `link` shows that link after its text.
 */
export const about = {
  name: "Eric Luttmann",
  intro: "I believe in enabling access to understanding & action through spatial & AI.",
  approach:
    "I’m a product person and ex-founder who’s built spatial & AI software with startups backed by Sequoia to global organizations like Nvidia. My work's been featured at an Autodesk keynote and I've given talks at Stanford University & ETH Zurich.",
  projectsLabel: "Projects",
  projects: [
    {
      text: "Product builder @ Pillar: spatial AI to help LA homeowners get insurance after fires",
      link: { label: "buildwithpillar.com", href: "https://buildwithpillar.com/" },
    },
    { text: "Design engineer: spatio temporal digital twin analysis for pro soccer coaches (FIFA for real life)" },
    { text: "Product design for LangChain's LangGraph Studio, LangSmith and Generative UI app" },
    {
      text: "Product for spatial AI tool to simulate natural disaster risk - Buckminster Fuller Institute, U.S. Government",
    },
    {
      text: "Product for AI web app that pulls forward decades of spatial data for institutions like Stanford University & State of Hawaii",
    },
    { text: "Designed ambient AI app for sales teams to prospect in minutes rather than days" },
    { text: "Founded Ombi, a video digital twin startup to feel spatial experiences" },
    { text: "3D product manager for an app to order buildings (keynote Autodesk University)" },
    { text: "Stanford University advisor on 3D workflows" },
    { text: "Built VR models & led architectural design reviews on $300M buildings" },
  ] as { text: string; link?: { label: string; href: string } }[],
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
};
