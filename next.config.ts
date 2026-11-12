import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The home page is the 3D world by default (Nov 12, Eric); `/?view=2d` serves the 2D gallery under the same URL.
  // Before the filesystem, so it wins over the static `/` page, which stays the 2D gallery. Old `/?view=3d` links
  // still land on the world.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", missing: [{ type: "query", key: "view", value: "2d" }], destination: "/world" }],
      afterFiles: [],
      fallback: [],
    };
  },
  // The 2D gallery moved from /gallery to the home page, and then behind `?view=2d`.
  async redirects() {
    return [{ source: "/gallery", destination: "/?view=2d", permanent: true }];
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
