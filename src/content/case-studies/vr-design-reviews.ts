import type { CaseStudy } from "@/content/case-study";

export const vrDesignReviews: CaseStudy = {
  path: "vr",
  tagline: "Immersive prototyping on commercial buildings",
  role: "VR Lead / Virtual Design & Construction (VDC) Engineer",
  blocks: [
    {
      kind: "text",
      paragraphs: ["At DPR I built VR models & led architectural design reviews on a $330M biotech building."],
    },
    {
      kind: "text",
      heading: "Overview",
      paragraphs: [
        "End user scientists & building owners made spatial / ergonomic design decisions in an HTC Vive & collaborative 3D displays. Feedback was shared back to architects & engineers to optimize interior spacing for teams developing cancer medicines. Historically this iteration would occur on 2D plans, a physical mockup or once the building was constructed.",
        [
          { text: "DPR Construction", href: "https://www.dpr.com/projects" },
          " is a pioneer of using 3D modeling (Building Information Modeling, BIM) & immersive tech to design & build projects such as Apple Park, UCSF Benioff Hospital, Google, Duke University, Genentech, etc.",
        ],
      ],
    },
    {
      kind: "figure",
      figure: {
        media: {
          kind: "video",
          src: "/work/vr/walkthrough.mp4",
          poster: "/work/vr/walkthrough-poster.webp",
          alt: "A VR walkthrough of the biotech building’s lab suite",
          width: 1656,
          height: 912,
        },
      },
    },
    {
      kind: "list",
      heading: "Role: VR Lead / VDC Engineer",
      items: [
        "Created VR models weekly by merging 30 design & construction models, applying textures & finishes & pushing into VR environment.",
        "Developed iterative prototyping process to align on expectations between end-user scientists, architects, & construction mgmt team.",
        "Managed team of more than 50 3D designers & builders to model building w/ precise geometry & system interfacing.",
        "Created specs for 3D geometry & data to guide 3D modelers on scope & precision.",
        "Developed modeling & review schedule w/ project leadership",
      ],
    },
    {
      kind: "list",
      heading: "Accessible spatial info for decision-making",
      items: [
        [
          { text: "Challenge:", strong: true },
          " Get scientist or architect to focus on a specific visual scope when they can access millions of polygons in a 233,000 sq. ft building",
        ],
        [
          { text: "Solution:", strong: true },
          " prioritized decision points via spatial viewpoints to guide the user through “distinguishing features of building”",
        ],
      ],
    },
    {
      kind: "text",
      heading: "Takeaways",
      paragraphs: [
        "This further validated the power of VR to communicate the human feeling of space. It’s a rich medium to make decisions on subjective, emotion-driven matters to then translate into objective measurements.",
        "The review process taught me to prototype & collaborate with stakeholders including end-users, designers, engineers, owners and contractors.",
      ],
    },
    {
      kind: "figures",
      figures: [
        {
          media: { kind: "image", src: "/work/vr/biotech-building.webp", alt: "Rendering of the biotech lab and office building", width: 856, height: 472 },
          caption: "Biotech lab in San Francisco Bay Area",
        },
        {
          media: { kind: "image", src: "/work/vr/entering-suite.webp", alt: "VR view entering the lab suite", width: 1654, height: 912 },
          caption: "Entering the suite",
        },
        {
          media: { kind: "image", src: "/exhibits/vr-design-reviews.webp", alt: "A scientist in a VR headset reviewing spacing", width: 800, height: 967 },
          caption: "Scientist reviewing spacing",
        },
      ],
    },
  ],
};
