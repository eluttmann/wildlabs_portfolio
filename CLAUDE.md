# Wild Labs Portfolio

AI-native 3D portfolio replacing ericluttmann.com and wildeylabs.com. The plan, milestones and decisions are in `docs/PLAN.md`; focused briefs for specific work streams are in `docs/briefs/` (e.g. `docs/briefs/rendering.md`).

@AGENTS.md

## Conventions
- **Next.js 16 App Router** (read `node_modules/next/dist/docs/` before using unfamiliar APIs; it differs from older versions).
- **pnpm only.** Ask before adding dependencies. Run `pnpm check` (typecheck, lint, build) before opening a PR; CI runs the same on every PR.
- **Branches:** `<type>/<scope>` (e.g. `feat/home-world`, `spike/marble-splats`), one PR each. Merging to `main` deploys production.
- **Pull requests:** Open PRs ready for review once `pnpm check` passes; use a draft only when work is unfinished or waits on a decision. Say what's unfinished or undecided in the PR description.
- **AI Gateway auth:** local dev uses `VERCEL_OIDC_TOKEN` from `vercel link`; never add a provider key or print secrets.
- **3D is client-only.** Load R3F scenes with `next/dynamic(..., { ssr: false })` from a client component.
- **One content source:** `src/content/projects.ts` feeds 2D, 3D and the chat. The chat must never invent facts that aren't in it.
- **Tokens:** CSS in `src/app/globals.css`, mirrored for three.js in `src/design/tokens.ts`. Change both together; never hardcode hex in components.
- **Type:** Helvetica Neue stack only. **Colour:** one Kelly colour per region (Buildings red, Applications yellow, Infra blue) on gallery white.
- **Layouts** for the Structure Lab live in `src/lab/layouts.ts` as pure functions (content → positions, sizes, camera, guides).
- Never render `+`, `−` or `≈` on figures in UI copy; say it in words.
