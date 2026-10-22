// Nano Banana (Gemini image) through Vercel AI Gateway. Auth: VERCEL_OIDC_TOKEN from .env.local.
//
//   node --env-file=.env.local scripts/render/nano-banana.mts \
//     --out <file.png> [--ref <image>]... [--aspect 4:3] [--size 2K] [--model <id>] --prompt "<text>"
//
// Reference images go first in the message, in the order given; the prompt says how to use them.
// Prints one JSON line (model, size, seconds, output path) for docs/renders/LOG.md.
import { generateText } from "ai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    prompt: { type: "string" },
    out: { type: "string" },
    ref: { type: "string", multiple: true, default: [] },
    aspect: { type: "string" },
    size: { type: "string", default: "2K" },
    model: { type: "string", default: "google/gemini-3.1-flash-image" },
  },
});

if (!values.prompt || !values.out) {
  console.error("Usage: nano-banana.mts --out <file> [--ref <image>]... [--aspect 4:3] [--size 2K] --prompt <text>");
  process.exit(1);
}

const refs = await Promise.all(
  values.ref.map(async (file) => ({ type: "file" as const, mediaType: "image", data: await readFile(file) })),
);

const started = performance.now();
const result = await generateText({
  model: values.model,
  messages: [{ role: "user", content: [...refs, { type: "text", text: values.prompt }] }],
  providerOptions: {
    google: {
      responseModalities: ["IMAGE"],
      imageConfig: { imageSize: values.size, ...(values.aspect ? { aspectRatio: values.aspect } : {}) },
    },
  },
});

const image = result.files.find((f) => f.mediaType.startsWith("image/"));
if (!image) {
  console.error("No image returned.", result.text);
  process.exit(1);
}

await mkdir(path.dirname(values.out), { recursive: true });
await writeFile(values.out, image.uint8Array);
console.log(
  JSON.stringify({
    model: values.model,
    size: values.size,
    aspect: values.aspect ?? null,
    refs: values.ref,
    mediaType: image.mediaType,
    seconds: Math.round((performance.now() - started) / 100) / 10,
    out: values.out,
  }),
);
