import type { Metadata } from "next";
import { LabShell } from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "Wild Labs: 3D",
};

/** The home page in 3D. Visitors reach it as `/?view=3d`, rewritten here in next.config.ts. */
export default function WorldPage() {
  return <LabShell />;
}
