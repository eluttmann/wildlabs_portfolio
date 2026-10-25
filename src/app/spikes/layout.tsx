import type { ReactNode } from "react";
import { notFound } from "next/navigation";

/**
 * Spikes are experiments, not part of the portfolio: they render on preview deployments and locally,
 * and 404 on the production deployment (Vercel sets VERCEL_ENV at build and run time).
 */
export default function SpikesLayout({ children }: { children: ReactNode }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return children;
}
