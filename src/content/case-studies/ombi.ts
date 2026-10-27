import type { CaseStudy } from "@/content/case-study";

export const ombi: CaseStudy = {
  path: "ombi",
  tagline: "Preview experiences through video",
  role: "Founder & CEO",
  blocks: [
    {
      kind: "text",
      paragraphs: [
        [
          { text: "Ombi", href: "https://joinombi.com" },
          " is a digital twin app to feel what a place is really like: an iOS & web app that lets you preview & book authentic restaurants through video.",
        ],
        "The immersive video structure lets guests guide themselves through the experience to feel the ambiance & see the food for themselves.",
        "Gen Z & Millennials share videos to receive gratitude when restaurant-goers go to a place from their post (by making a reservation, saving, sharing, or opening directions).",
        ["Download Ombi ", { text: "here", href: "https://apps.apple.com/us/app/ombi-preview-restaurants/id1598753264" }],
      ],
    },
    {
      kind: "figure",
      figure: {
        media: { kind: "image", src: "/work/ombi/frames.webp", alt: "Four Ombi screens: preview restaurants, feel the ambiance, see the menu, capture to inspire others", width: 1653, height: 751 },
      },
    },
    {
      kind: "list",
      heading: "Role: Founder & CEO",
      items: [
        "Owned product strategy, product development, user research (more than 250 interviews), UX design, prototype testing, 2-sided marketplace growth, fundraising, recruiting, partnership development.",
        "Co-led product design, engineering, brand design.",
        "Built iOS app in Swift w/ UIKit, AVFoundation, Firebase API, Cloudinary API, Mixpanel API, etc.",
        "Recruited & led team of 2 engineers & 1 product designer.",
        [
          "Grew San Francisco community – acquired Ombi video creators (“",
          { text: "Tastemakers", href: "https://joinombi.com/tm825/" },
          "”) who reach 2.6M viewers on social media.",
        ],
      ],
    },
    {
      kind: "figure",
      width: "measure",
      figure: {
        media: {
          kind: "video",
          src: "/exhibits/ombi.mp4",
          poster: "/exhibits/ombi-poster.webp",
          alt: "The Ombi app on a phone, previewing a restaurant through video",
          width: 362,
          height: 704,
        },
      },
    },
    {
      kind: "points",
      heading: "Key design elements",
      points: [
        {
          title: "Immersive video structure",
          items: [
            "“Phase tabs” let guests guide themselves through interior / outdoor spaces + sections of the menu. This emulates an in-person experience & organizes spatial information (inspired by VR walkthroughs).",
          ],
        },
        {
          title: "Designing for users’ existing decision making process",
          ordered: true,
          items: [
            "Filter by experience type & neighborhood (e.g. dinner in Mission District)",
            "Preview videos of restaurants’ ambiance & menu to create expectations",
            "Share / choose: share web-app link w/ friends in message threads",
            "Book & go: make a reservation, open directions, save to profile",
          ],
        },
        {
          title: "Experience > efficiency",
          items: [
            "To connect restaurant-goers with the best experience for a specific occasion, experiential info (visual, sensory) is prioritized over location. Users browse a city through a video thumbnail UI rather than a map (videos are organized by experience > location > creator).",
          ],
        },
      ],
    },
    {
      kind: "quotes",
      heading: "User quotes",
      quotes: [
        { text: "Ombi shows the in-between factor", by: "Jason Chavenson, Michelin Star Chef, Bar Spero" },
        { text: "Berber is a full experience – I’m going to post on Ombi", by: "Charles S, Ombi video creator" },
        { text: "Ombi is presence for spaces", by: "Cedric I, ex-HoloLens designer" },
      ],
    },
    {
      kind: "text",
      heading: "Takeaways",
      paragraphs: [
        ["Ombi has proven that Gen Z & Millennials want to use ", { text: "video", strong: true }, " to choose restaurant experiences."],
        [
          "Users associate Ombi with the ",
          { text: "atmosphere / spatial elements", strong: true },
          " of an experience, more so than the food. Video creators are 70% more likely to post videos of the space / environment, than food dishes.",
        ],
      ],
    },
  ],
};
