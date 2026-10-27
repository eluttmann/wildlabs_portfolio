import type { Viewport } from "next";
import type { ReactNode } from "react";
import { color } from "@/design/tokens";

export const viewport: Viewport = {
  themeColor: color.paper,
};

/** The 2D world: the gallery and its project pages on white walls. Each page renders its own nav size. */
export default function TwoDLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-paper text-ink">{children}</div>;
}
