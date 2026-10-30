// Review sheet: the same fixed views of every world, captured from the running spike in real time.
//
//   pnpm dev   # in another terminal
//   node scripts/render/review-sheet.mts --world yosemite-meadow-text [--world …] [--res full_res] [--out <dir>]
//     [--look "tone=none&blur=0" --tag sharp] [--views 00m-north,00m-west]
//
// Drives Chrome through the DevTools protocol (not `--screenshot`, which fires before the splats load). For each
// world it waits for the page to drop its "Loading world" message, lets Spark settle, and saves one JPEG per view:
// four directions at the viewer, then forward views walked 10, 20 and 40 m down the path, which show where the world
// degrades. Captures match a 16-inch MacBook Pro at full screen (1728×1117 at 2×). `--look` passes render settings
// (see pickLook in SplatWorldScene) and `--tag` names their folder. Files land in
// ~/build/wildlabs-assets/reviews/<world>[/<tag>]/ by default (never in git).
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    world: { type: "string", multiple: true, default: [] },
    res: { type: "string", default: "full_res" },
    base: { type: "string", default: "http://localhost:3000" },
    out: { type: "string" },
    look: { type: "string", default: "" },
    tag: { type: "string" },
    views: { type: "string" },
    chrome: { type: "string", default: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
  },
});

const VIEWS = [
  { name: "00m-north", at: 0, yaw: 0 },
  { name: "00m-west", at: 0, yaw: 90 },
  { name: "00m-south", at: 0, yaw: 180 },
  { name: "00m-east", at: 0, yaw: 270 },
  { name: "10m-north", at: 10, yaw: 0 },
  { name: "20m-north", at: 20, yaw: 0 },
  { name: "40m-north", at: 40, yaw: 0 },
];
const SCREEN = { width: 1728, height: 1117, deviceScaleFactor: 2 };
const SETTLE_MS = 4_000;
const LOAD_TIMEOUT_MS = 120_000;
const PORT = 9333;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const profile = await mkdtemp(path.join(tmpdir(), "review-sheet-"));
const chrome = spawn(
  values.chrome,
  [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--headless=new", `--window-size=${SCREEN.width},${SCREEN.height}`, "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);

try {
  let wsUrl = "";
  for (let i = 0; i < 50 && !wsUrl; i++) {
    await sleep(200);
    const targets = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json() as Promise<{ type: string; webSocketDebuggerUrl: string }[]>).catch(() => []);
    wsUrl = targets.find((t) => t.type === "page")?.webSocketDebuggerUrl ?? "";
  }
  if (!wsUrl) throw new Error("Chrome didn't expose a page target");

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let nextId = 0;
  const pending = new Map<number, (result: unknown) => void>();
  ws.onmessage = (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id !== undefined) pending.get(msg.id)?.(msg.error ? Promise.reject(new Error(msg.error.message)) : msg.result);
  };
  const send = <T,>(method: string, params: object = {}) =>
    new Promise<T>((resolve) => {
      const id = ++nextId;
      pending.set(id, resolve as (result: unknown) => void);
      ws.send(JSON.stringify({ id, method, params }));
    });
  await send("Emulation.setDeviceMetricsOverride", { ...SCREEN, mobile: false });
  const evaluate = async (expression: string) =>
    (await send<{ result: { value: unknown } }>("Runtime.evaluate", { expression, returnByValue: true })).result.value;

  for (const world of values.world) {
    const dir = values.out ?? path.join(homedir(), "build/wildlabs-assets/reviews", world, values.tag ?? "");
    await mkdir(dir, { recursive: true });
    const wanted = values.views?.split(",");
    for (const view of VIEWS.filter((v) => !wanted || wanted.includes(v.name))) {
      const look = values.look ? `&${values.look}` : "";
      const url = `${values.base}/spikes/yosemite?world=${world}&res=${values.res}&at=${view.at}&yaw=${view.yaw}${look}`;
      await send("Page.navigate", { url });
      const started = Date.now();
      await sleep(1_000);
      for (;;) {
        const state = await evaluate(
          `document.querySelector("canvas") ? (document.body.innerText.includes("isn't available") ? "error" : document.body.innerText.includes("Loading world") ? "loading" : "ready") : "loading"`,
        );
        if (state === "error") throw new Error(`${world} failed to load at ${url}`);
        if (state === "ready") break;
        if (Date.now() - started > LOAD_TIMEOUT_MS) throw new Error(`${world} timed out at ${url}`);
        await sleep(500);
      }
      await sleep(SETTLE_MS);
      const shot = await send<{ data: string }>("Page.captureScreenshot", { format: "jpeg", quality: 85 });
      const file = path.join(dir, `${view.name}.jpg`);
      await writeFile(file, Buffer.from(shot.data, "base64"));
      console.log(`${world} ${view.name}  ${((Date.now() - started) / 1000).toFixed(0)} s → ${file}`);
    }
  }
  ws.close();
} finally {
  chrome.kill();
}
