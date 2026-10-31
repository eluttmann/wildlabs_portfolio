import type { Metadata } from "next";
import { LabShell } from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "Wild Labs: Structure",
};

/**
 * The Structure Lab: six ways to arrange the projects in space (src/lab/layouts.ts). It was the 3D home until the
 * meadow world took `/?view=3d` on Oct 30; it stays here while the layouts are reviewed as lenses.
 */
export default function StructurePage() {
  return <LabShell />;
}
