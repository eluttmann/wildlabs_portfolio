import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

/**
 * Development only: serves splat exports and backdrop panoramas from ~/build/wildlabs-assets/worlds, which stay
 * out of git. Hosting for preview and production (Vercel Blob or the World Labs asset URL) is decided in M2.
 */
const TYPES: Record<string, string> = { spz: "application/octet-stream", jpg: "image/jpeg" };

export async function GET(_req: Request, ctx: RouteContext<"/spikes/splats/[world]/[file]">) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const { world, file } = await ctx.params;
  const ext = /^[\w-]+\.(spz|jpg)$/.exec(file)?.[1];
  if (!/^[a-z0-9-]+$/.test(world) || !ext) return new Response("Not found", { status: 404 });

  const data = await readFile(path.join(homedir(), "build/wildlabs-assets/worlds", world, file)).catch(() => null);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": TYPES[ext], "Cache-Control": "no-store" } });
}
