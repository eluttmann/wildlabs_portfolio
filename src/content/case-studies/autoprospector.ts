import type { CaseStudy } from "@/content/case-study";

export const autoprospector: CaseStudy = {
  path: "autoprospector",
  tagline: "Automate knowledge work processes using AI",
  role: "Founding Product Designer",
  blocks: [
    {
      kind: "text",
      paragraphs: [
        [
          "Designed AI web app to ",
          { text: "do knowledge work processes in minutes rather than hours or days.", strong: true },
          " It augments your browser with AI so you focus on human decisions upfront, then let compute handle the manual tasks.",
        ],
        [
          "The web app I designed ",
          { text: "automates sales prospecting", strong: true },
          " to help business development (BD) teams ",
          { text: "3x revenue", strong: true },
          " by doing the niche research for companies & contacts in batch.",
        ],
      ],
    },
    {
      kind: "text",
      heading: "Customers",
      paragraphs: ["Customers include Alchemy, Orum, Luma Health, Gainsight, Carta, Dooly, etc."],
    },
    {
      kind: "quotes",
      quotes: [
        {
          // "[AutoProspector]" replaces the product's earlier name, Omni, in the original quote.
          text: "[AutoProspector] helped us 3X our revenue added & pipelined. We 10Xed our volume from 3,000 calls to 30,000 calls a month",
          by: "Jon Pike, Luma Health, Sr. Director of Go-to-Market Ops",
        },
        {
          text: "It’s like magic. Like a little robot man inside my computer doing everything for me.",
          by: "Terry H, Orum, VP of Engagement",
        },
      ],
    },
    {
      kind: "text",
      heading: "Investors",
      paragraphs: [
        "Investors include Homebrew (Hunter Walk), BoxGroup, the founders of Behance, Airtable, Flexport, Carta, Lattice, NerdWallet, WePay, Tilt.",
      ],
    },
    {
      kind: "figure",
      figure: {
        media: { kind: "image", src: "/exhibits/autoprospector.webp", alt: "AutoProspector on a laptop", width: 1600, height: 900 },
      },
    },
    {
      kind: "list",
      heading: "Role: Founding Product Designer",
      items: [
        "Designed AI future-of-work app that helps sales teams 3X revenue and 10X call volume",
        "Designed information architecture, UX, product design, customer success experience",
        "Managed product roadmap & backlog, wrote product specs, integrated Scrum practices into product development",
        "Developed information architecture that consolidates prospecting workflow into single page experience to queue AI prompts, run automations & visualize data",
        "Designed UX for AI prompt input & settings to research company & contact data at scale",
      ],
    },
  ],
};
