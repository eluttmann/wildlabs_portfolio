// World Labs World API (Marble) from the terminal. Auth: WORLD_LABS_API_KEY from .env.local.
//
//   node --env-file=.env.local scripts/render/worldlabs.mts credits
//   node --env-file=.env.local scripts/render/worldlabs.mts generate --world yosemite --image <file> \
//     [--model marble-1.1] [--prompt "<text>"] [--pano] [--confirm]
//   node --env-file=.env.local scripts/render/worldlabs.mts fetch --world yosemite --id <world_id>
//   node --env-file=.env.local scripts/render/worldlabs.mts list
//
// `generate` is a dry run unless --confirm is passed: generation spends credits (see docs/briefs/rendering.md §7).
// Downloads land in ~/build/wildlabs-assets/worlds/<world>/ (never in git): one .spz per resolution,
// the generated pano, the thumbnail, and world.json with the metric scale and ground offset.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const API = "https://api.worldlabs.ai/marble/v1";
const KEY = process.env.WORLD_LABS_API_KEY;
if (!KEY) throw new Error("WORLD_LABS_API_KEY is not set (run with --env-file=.env.local).");

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    world: { type: "string" },
    image: { type: "string" },
    id: { type: "string" },
    model: { type: "string", default: "marble-1.1" },
    prompt: { type: "string" },
    pano: { type: "boolean", default: false },
    confirm: { type: "boolean", default: false },
  },
});

async function api<T>(method: "GET" | "POST", route: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: { "WLT-Api-Key": KEY!, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${route} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

interface World {
  world_id: string;
  display_name: string;
  model?: string | null;
  world_marble_url: string;
  assets?: {
    caption?: string | null;
    thumbnail_url?: string | null;
    imagery?: { pano_url?: string | null } | null;
    splats?: {
      spz_urls?: Record<string, string> | null;
      semantics_metadata?: { metric_scale_factor?: number; ground_plane_offset?: number } | null;
    } | null;
  } | null;
}

interface Operation {
  operation_id: string;
  done: boolean;
  error?: { code?: number | null; message?: string | null } | null;
  cost?: { total_credits: number; line_items?: { name: string; credits: number }[] } | null;
  response?: World | null;
}

const credits = async () => (await api<{ remaining_credits: number }>("GET", "/credits")).remaining_credits;

async function upload(file: string): Promise<string> {
  const ext = path.extname(file).slice(1).toLowerCase();
  const prepared = await api<{
    media_asset: { media_asset_id: string };
    upload_info: { upload_url: string; upload_method: string; required_headers?: Record<string, string> | null };
  }>("POST", "/media-assets:prepare_upload", { file_name: path.basename(file).slice(0, 64), kind: "image", extension: ext });
  const put = await fetch(prepared.upload_info.upload_url, {
    method: prepared.upload_info.upload_method,
    headers: prepared.upload_info.required_headers ?? {},
    body: await readFile(file),
  });
  if (!put.ok) throw new Error(`Upload failed: ${put.status} ${await put.text()}`);
  return prepared.media_asset.media_asset_id;
}

async function poll(operationId: string): Promise<Operation> {
  for (;;) {
    const op = await api<Operation>("GET", `/operations/${operationId}`);
    if (op.done) return op;
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 10_000));
  }
}

async function download(world: string, w: World) {
  const dir = path.join(homedir(), "build/wildlabs-assets/worlds", world);
  await mkdir(dir, { recursive: true });
  const files: Record<string, string> = { ...(w.assets?.splats?.spz_urls ?? {}) };
  const named = Object.fromEntries(Object.entries(files).map(([res, url]) => [`${res}.spz`, url]));
  if (w.assets?.imagery?.pano_url) named["pano.jpg"] = w.assets.imagery.pano_url;
  if (w.assets?.thumbnail_url) named["thumbnail.jpg"] = w.assets.thumbnail_url;
  for (const [name, url] of Object.entries(named)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download ${name} failed: ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(dir, name), bytes);
    console.log(`  ${name}  ${(bytes.length / 1e6).toFixed(1)} MB`);
  }
  await writeFile(path.join(dir, "world.json"), JSON.stringify(w, null, 2));
  console.log(`  world.json → ${dir}`);
}

const command = positionals[0];

if (command === "credits") {
  console.log(await credits());
} else if (command === "list") {
  console.log(JSON.stringify(await api("POST", "/worlds:list", {}), null, 2));
} else if (command === "fetch") {
  if (!values.world || !values.id) throw new Error("fetch needs --world and --id");
  await download(values.world, await api<World>("GET", `/worlds/${values.id}`));
} else if (command === "generate") {
  if (!values.world || !values.image) throw new Error("generate needs --world and --image");
  const request = (mediaAssetId: string) => ({
    display_name: values.world,
    model: values.model,
    permission: { public: false },
    world_prompt: {
      type: "image",
      image_prompt: { source: "media_asset", media_asset_id: mediaAssetId },
      is_pano: values.pano,
      ...(values.prompt ? { text_prompt: values.prompt } : {}),
    },
  });
  const before = await credits();
  console.log(`Credits before: ${before}`);
  if (!values.confirm) {
    console.log("Dry run (no upload, no spend). Request:", JSON.stringify(request("<media_asset_id>"), null, 2));
    process.exit(0);
  }
  const started = Date.now();
  const mediaAssetId = await upload(values.image);
  const op = await api<Operation>("POST", "/worlds:generate", request(mediaAssetId));
  console.log(`Operation ${op.operation_id}`);
  const done = await poll(op.operation_id);
  console.log("");
  if (done.error || !done.response) throw new Error(`Generation failed: ${JSON.stringify(done.error)}`);
  const minutes = ((Date.now() - started) / 60_000).toFixed(1);
  console.log(JSON.stringify({ world_id: done.response.world_id, url: done.response.world_marble_url, cost: done.cost, minutes }));
  console.log(`Credits after: ${await credits()}`);
  await download(values.world, await api<World>("GET", `/worlds/${done.response.world_id}`));
} else {
  console.error("Commands: credits | list | generate | fetch");
  process.exit(1);
}
