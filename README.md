# Wild Labs Portfolio

An AI-native, 3D portfolio. World models build the places and an LLM directs the experience. See **[docs/PLAN.md](docs/PLAN.md)**.

## Run

```bash
nvm use                      # Node 24, from .nvmrc
pnpm install
cp .env.example .env.local   # add keys when needed
vercel link                  # links the Vercel project and adds VERCEL_OIDC_TOKEN for AI Gateway
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm typecheck` | TypeScript, no output |
| `pnpm lint` | ESLint |
| `pnpm check` | Typecheck, lint and production build (the same checks CI runs on every PR) |

## Deploys

Vercel project `luttmann/wildlabs-portfolio`. Merging to `main` deploys production (https://wildlabs-portfolio.vercel.app); every other branch gets a preview URL.

## AI Gateway auth

Local dev uses the Vercel OIDC token from `vercel link` (refresh it with `vercel link` when it expires, about every 12 hours). Deployments authenticate automatically. An `AI_GATEWAY_API_KEY` is only needed for long-running terminal scripts.

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
