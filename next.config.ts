import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The home page is 2D by default; `/?view=3d` serves the 3D world under the same URL. Before the
  // filesystem, so it wins over the static `/` page.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", has: [{ type: "query", key: "view", value: "3d" }], destination: "/world" }],
      afterFiles: [],
      fallback: [],
    };
  },
  // The 2D gallery moved from /gallery to the home page.
  async redirects() {
    return [{ source: "/gallery", destination: "/", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
