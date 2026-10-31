// Upload a big world asset (backdrop panorama, splat file) to the project's public Vercel Blob store.
//
//   node --env-file=.env.local scripts/render/blob-put.mts <file> <pathname>
//   e.g. … ~/build/wildlabs-assets/worlds/yosemite-photo-plus-v2/backdrop-8k.jpg worlds/yosemite-meadow/backdrop-8k.jpg
//
// Uses BLOB_READ_WRITE_TOKEN from `vercel env pull` and passes it to the Vercel CLI without printing it (the CLI
// refuses to choose when .env.local also holds an OIDC token). Files get a random suffix and a one-year cache, so a
// new upload is a new URL; put the printed URL in src/components/spikes/worlds.ts.
import { spawnSync } from "node:child_process";
import path from "node:path";

const [file, pathname] = process.argv.slice(2);
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!file || !pathname) throw new Error("Usage: blob-put.mts <file> <pathname>");
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set (run vercel env pull, then --env-file=.env.local).");

const types: Record<string, string> = { ".jpg": "image/jpeg", ".webp": "image/webp", ".spz": "application/octet-stream" };
const env = { ...process.env };
delete env.VERCEL_OIDC_TOKEN;
delete env.BLOB_STORE_ID;

const result = spawnSync(
  "vercel",
  [
    "blob", "put", file,
    "--pathname", pathname,
    "--access", "public",
    "--add-random-suffix", "true",
    "--cache-control-max-age", "31536000",
    "--content-type", types[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "--rw-token", token,
  ],
  { env, encoding: "utf8" },
);
// Print the CLI's output with the token masked, in case it ever echoes arguments.
const out = `${result.stdout}${result.stderr}`.replaceAll(token, "***");
console.log(out.trim());
process.exit(result.status ?? 1);
