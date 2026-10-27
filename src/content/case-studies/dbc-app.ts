import type { CaseStudy } from "@/content/case-study";

const step = (src: string, caption: string, alt: string) => ({
  media: { kind: "image" as const, src: `/work/dbc/${src}.webp`, alt, width: 1194, height: 878 },
  caption,
});

export const dbcApp: CaseStudy = {
  path: "dbc",
  tagline: "Order buildings from 3D models",
  role: "Product Lead",
  blocks: [
    {
      kind: "text",
      paragraphs: [
        [
          { text: "DBC", href: "https://www.digitalbuilding.com/process" },
          " digitally fabricates commercial buildings from 3D models using robotics.",
        ],
      ],
    },
    {
      kind: "text",
      heading: "Overview",
      paragraphs: [
        "The DBC App lets teams order buildings from 3D models off an iPad.",
        "It’s been used on capital projects (up to $300M) across the US – the 3D model data initiates robotic fabrication of each building at the factory.",
        "Clients have included University of California, Merck, AC Hotels, etc.",
        "The app was part of the 2019 Keynote for Autodesk University – Forge Developer’s Conference.",
      ],
    },
    {
      kind: "figure",
      figure: {
        media: { kind: "image", src: "/work/dbc/supply-chain-1.webp", alt: "DBC process, part one: fabrication model, ordering the building on an iPad, robotic digital fabrication", width: 2160, height: 546 },
      },
    },
    {
      kind: "figure",
      figure: {
        media: { kind: "image", src: "/work/dbc/supply-chain-2.webp", alt: "DBC process, part two: bunk and ship panels, manage the supply chain on a laptop, the completed building", width: 2160, height: 510 },
      },
    },
    {
      kind: "list",
      heading: "Role: Product Lead",
      items: [
        "Led a team of 3 software engineers & two 3D modelers through the product lifecycle from idea conception to production use.",
        "Owned product strategy & roadmap, product design, UX design, 3D model requirements for Autodesk API, iterative user testing, production implementation, cost / schedule mgmt.",
        {
          text: "Developed 3D model requirements so that:",
          items: [
            "geometry was lightweight & responsive on an iPad",
            "users could assign order sequences to model elements & be translated to NoSQL database & fabrication process",
          ],
        },
        {
          text: "Presented on product & fabrication process at:",
          items: [
            "Stanford University Industrialized Construction Forum 2019",
            "Stanford Center for Integrated Facility Engineering (CIFE) / Project-Based Learning (PBL) Lab",
            "ETH Zurich",
          ],
        },
      ],
    },
    { kind: "chapter", title: "Order" },
    {
      kind: "figures",
      figures: [
        step("choose-building", "1. Choose a building", "The DBC App home screen with a list of buildings"),
        step("define-areas", "2. Define areas (e.g. north facade)", "A building facade split into named areas"),
        step("sequence-panels", "3. Sequence panels", "Wall panels numbered in installation order"),
        step("place-order", "4. Place your order", "The order cart with a delivery date"),
      ],
    },
    {
      kind: "list",
      heading: "Ordering flow",
      ordered: true,
      items: [
        "Choose the project you’d like to order",
        "Define areas (e.g. north facade): this simplifies a floor or facade into manageable components",
        "Sequence panels (6 to 14 ft components) in order you plan to install to drive fab / shipping sequence – visualize simulation of installation to confirm",
        "Place your order – add areas to cart & communicate delivery date to factory",
      ],
    },
    {
      kind: "text",
      heading: "Product experience",
      paragraphs: [
        "“E-commerce for Buildings” – creating a building should feel more like ordering from Amazon or calling an Uber rather than “construction”.",
      ],
    },
    {
      kind: "points",
      heading: "Takeaways",
      points: [
        {
          title: "Visuals to simplify the building product & process",
          items: [
            "A commercial building is a complex product with a complicated design & construction process. The DBC App makes the building scope accessible through lightweight 3D models on an iPad. It simplifies an email driven, manual process into a six-step flow the builder can progress through themselves.",
          ],
        },
        {
          title: "Predictable results & eliminating waste",
          items: [
            "The app enables teams to directly communicate their order & installation sequence at a manufacturing unit level (wall panel) rather than a manual transfer of text from 2D PDFs. It reduces rework by allowing teams to work with the live 3D model scope, rather than outdated 2D PDF exports.",
          ],
        },
      ],
    },
    { kind: "chapter", title: "Manage" },
    {
      kind: "text",
      paragraphs: [
        "DBC Manage was a visual tracking portal for teams to gain insight into the fabrication, delivery and installation phases of a project.",
        "The product was tested on projects in the Bay Area and Austin, however existing industry products proved sufficient, leading us to end development.",
        "The 3D viewers developed with the Autodesk Assemble API were shared & used by industry partners.",
      ],
    },
    {
      kind: "figure",
      figure: {
        media: {
          kind: "video",
          src: "/work/dbc/manage-demo.mp4",
          poster: "/work/dbc/manage-poster.webp",
          alt: "DBC Manage tracking fabrication and delivery on a 3D building model",
          width: 1912,
          height: 934,
        },
      },
    },
  ],
};
