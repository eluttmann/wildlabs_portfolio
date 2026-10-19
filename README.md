# Wild Labs Portfolio

An AI-native, 3D portfolio. World models build the places and an LLM directs the experience. See **[docs/PLAN.md](docs/PLAN.md)**.

## Run

```bash
pnpm install
cp .env.example .env.local   # add keys when needed
pnpm dev                     # http://localhost:3000
```

## Where things are

| Path | What |
|---|---|
| `docs/PLAN.md` | Architecture, milestones M0–M7, budget, risks |
| `src/content/projects.ts` | The single content source (9 projects) |
| `src/lab/layouts.ts` | The six M1 spatial structures |
| `src/components/lab/` | Structure Lab: R3F scene, glass orbs, guides, UI |
| `src/design/tokens.ts` | Design tokens for the 3D scene |

## Structure Lab controls

Keys `1`–`6` switch structures · drag to orbit · scroll to zoom · click an orb to focus · `Esc` to reset.
