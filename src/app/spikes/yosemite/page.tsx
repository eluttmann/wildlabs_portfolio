import type { Metadata } from "next";
import { SplatWorldView } from "@/components/spikes/SplatWorldView";
import { yosemite } from "@/components/spikes/worlds";

export const metadata: Metadata = {
  title: "Yosemite world spike",
  robots: { index: false },
};

export default function YosemiteSpike() {
  return <SplatWorldView world={yosemite} />;
}
