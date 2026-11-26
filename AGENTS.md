# Linie

Blueprint-inspired network operations frontend template (React 19, strict TypeScript, Vite, Radix Themes, Lucide, Biome) served by a Cloudflare Worker (`cf`).
Docs: [README.md](README.md) · [Architecture](docs/architecture.md) · [Deployment](docs/deployment.md) · [CI & Deploy](docs/ci.md) · [CHANGELOG](CHANGELOG.md) · [Retrospective](Retrospective.md)

## Commands

Run from root with Node 22.23+ / 24.22+ / 26.12+ (CI uses Node 26.13.0, npm 11.20.0, locked `cf` 1.0.0-beta.26) and the committed `package-lock.json`.

```sh
npm ci
npm run dev                 # cf dev (Vite + workerd on 127.0.0.1:7064; https://linie.dev.hexly.ai via Caddy)
npm run typecheck           # S1: tsc -b
npm run lint                # S2: Biome check-only, 0 warnings
npm run test                # Vitest unit tests
npm run test:coverage       # L1: >= 80% on models, viewmodels, worker, verify-deployment
npm run check               # lint + typecheck + test:coverage
npm run test:e2e            # L4: desktop Chrome core smoke vs running server; CI=true uses bundled Chromium on 127.0.0.1:17064 (reuses B1 output)
npm run build               # tsc -b && cf build -> .cloudflare/output/v0/
npm run deploy:dry-run      # B1: build + validate prebuilt Cloudflare output without uploading
npm run deploy              # check + build + cf deploy --prebuilt --mode production (requires explicit authorization)
npm run verify:deployment   # verify public /api/live version + deployed JS/CSS SHA-256 vs local build
```

Local HTTPS acceptance (reads existing public mkcert CA for Playwright's Node request client without altering trust stores):

```sh
NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" PLAYWRIGHT_BASE_URL=https://linie.dev.hexly.ai npm run test:e2e
```

## Invariants

- Preserve the `~/Downloads/linie.jpeg` identity inside the shell: warm paper, teal ink, coordinate rulers, dense tables, and six numbered panels ([docs/architecture.md](docs/architecture.md)).
- Sidebar starts expanded and closes via one persistent toolbar toggle; the right-hand operations companion starts closed and provides explicitly simulated, read-only local chat.
- Enforce MVVM layering: `src/models` (types, fixtures, pure operations), `src/viewmodels` (state, commands), `src/views` (rendering), `src/components` (reusable UI), and `src/styles` (tokens, layout).
- Use Radix Themes standard controls; domain-specific topology and telemetry drawings may use SVG. Infrastructure actions and chat are local simulations with no AI or infrastructure credentials configured.
- Keep demo status visibly labeled; never imply fixture data is live production data.
- `cloudflare.config.ts` and `cf` are authoritative for the SPA and Worker-owned `/api/live`; do not introduce Wrangler configuration or deploy with Wrangler.
- Anonymous `/api/live` reports Worker liveness and manifest version only, returning JSON with `Cache-Control: no-store` (never a cached SPA fallback); unknown `/api/*` returns JSON 404.
- `package.json` is the authoritative version (injected by Vite and imported by the Worker); maintain [CHANGELOG.md](CHANGELOG.md) and follow [docs/deployment.md](docs/deployment.md).
- Production deploys (`npm run deploy`) require explicit publication authorization; version changes and Cloudflare deploys do not authorize Git tags or GitHub Releases.
- Keep `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub's `production` environment, passed by name to [deploy.yml](.github/workflows/deploy.yml); never expose to CI or `secrets: inherit`.
- [deploy.yml](.github/workflows/deploy.yml) accepts only same-repo `main`-push CI (`quality / Z1: Gate`), proves source SHA, rejects stale `main`, and runs `cf` under a non-cancelling production lock.

## Quality & Local Gates

Follows `system1-quality`; CI slot definitions and full-SHA-pinned actions (`nocoo/base-ci`) live in [quality-slots.yml](.github/workflows/quality-slots.yml) (`quality / Z1: Gate` gates deploy). Status vocabulary: `enforced`, `planned`, `manual`, `N/A`.

- **Enforced CI slots**: `S1`–`S3`, `G1`, `G2`, `B1`, `L1`, `L4`, `P1` (aggregated by `Z1: Gate`); `S3` enforces 40-char SHA pinning on all external workflow actions.
- **L1 coverage (80% all 4 metrics)**: covers `src/models`, `src/viewmodels`, `worker`, `scripts/verify-deployment.ts`; excludes pure Views, build config, and `verify-production.ts`.
- **Exceptions / gaps**: `L2 Runtime` is `N/A` (Worker routes covered in Vitest `L1`); `L3 Integration` is `N/A` (covered by `L4` Playwright).
- **Local hooks**: automated `pre-commit` / `pre-push` hooks are `planned` (none configured); run `npm run check` (`manual`) before commits and `npm run test:e2e` against the running server before pushing.

## Resources & Isolation

| Lane   | Endpoint / State                                                      | Boundary                                                                                      |
| ------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Dev    | `https://linie.dev.hexly.ai` -> Caddy -> `127.0.0.1:7064`             | Run in Herdr tab `dev server`; do not start background servers; local E2E uses running server |
| CI E2E | `http://127.0.0.1:17064` (Playwright preview); `27064` reserved (BDD) | `CI=true` builds, starts/stops isolated preview, refuses occupied port                        |
| Prod   | `https://linie.hexly.ai` (Cloudflare Worker `linie` + assets)         | Read-only checks unless publication is authorized; `workers.dev` and preview URLs disabled    |

## Retrospective

Record incident narratives, CI/CD activation evidence ([docs/ci.md](docs/ci.md)), and deployment verifications in [Retrospective.md](Retrospective.md); promote recurring constraints to `Invariants` above and enforceable safeguards to tests/hooks.
