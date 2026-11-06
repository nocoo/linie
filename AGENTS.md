# Linie

A frontend template for a large-scale network operations platform. The visual reference is `~/Downloads/linie.jpeg`: a technical drawing with a warm paper background, teal ink, coordinate rulers, dense tables and six numbered panels. Preserve this identity inside the workspace shell. The sidebar starts expanded and can close; the right-hand operations companion starts closed and provides explicitly simulated, read-only local chat.

## Stack

- React, TypeScript (strict), Vite, Radix Themes, Lucide icons, Biome.
- npm with a committed lockfile. Follow the machine's permitted registry rule.
- MVVM: `src/models` owns domain types, fixtures and pure operations; `src/viewmodels` owns application state and commands; `src/views` renders state; `src/components` owns reusable presentation; `src/styles` owns design tokens and layout.
- Use Radix standard controls. Domain-specific topology and telemetry drawings may use SVG. Infrastructure actions and chat are local simulations; no AI or infrastructure credentials are configured.
- Cloudflare serves the SPA and the Worker-owned anonymous `/api/live` endpoint. `cloudflare.config.ts` and `cf` are authoritative; do not introduce Wrangler configuration or deploy with Wrangler.
- The health route reports Worker liveness and manifest version only. It must return JSON with `Cache-Control: no-store`, never a cached SPA fallback.
- The demo must be visibly labeled. Never imply fixture data is live production data.

## Commands

- `npm run dev`: `cf dev`, running Vite + workerd on `127.0.0.1:7064`. Normal browser origin: `https://linie.dev.hexly.ai` through Caddy.
- Production origin: `https://linie.hexly.ai`. CI uses a Playwright-owned production preview on E2E 17064; BDD 27064 is reserved. Normal local browser tests use an already running server.
- `npm run check`: Biome (warnings rejected), strict TypeScript and coverage tests.
- `npm run test`: unit tests.
- `npm run test:coverage`: Models, ViewModels, Worker and deployment-verification logic with statements, branches, functions and lines each enforced at 95%; pure Views, build configuration and the thin verification CLI entrypoint are excluded.
- `npm run test:e2e`: Chrome desktop/mobile tests against the running server locally. With `CI=true`, use bundled Chromium, build the app and start/stop the isolated preview through Playwright.
- `npm run build`: TypeScript and `cf build`; output is `.cloudflare/output/v0/`.
- `npm run deploy:dry-run`: build and validate the prebuilt Cloudflare output without uploading.
- `npm run deploy`: checks, builds and deploys via `cf deploy --prebuilt --mode production`; requires explicit publication authorization.
- `npm run verify:deployment`: validate public health/version and SHA-256 equality of deployed entry assets against the local production build.
- `NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" PLAYWRIGHT_BASE_URL=https://linie.dev.hexly.ai npm run test:e2e`: browser and API checks through local HTTPS, with explicit trust in the existing public mkcert CA certificate.

No automatic pre-commit gate or L1 certification is claimed. `docs/architecture.md` describes data semantics and design decisions. `package.json` is the authoritative version, injected by Vite and imported by the Worker. Maintain `CHANGELOG.md`; follow `docs/deployment.md`. Version changes and Cloudflare deployment do not automatically authorize Git push, tags or GitHub Releases.

`.github/workflows/ci.yml` and `deploy.yml` pin `nocoo/base-ci` to a full SHA. CI covers quality, security, build dry-run, browser tests and workflow lint. Deployment accepts only successful same-repository main-push CI, proves the source SHA, rejects stale main and uses `cf` under a non-cancelling production lock. Keep production credentials in the exact GitHub `production` environment; never pass them into CI or inherit all secrets. Activation and exact-run evidence are documented in `docs/ci.md` and `Retrospective.md`.

Use a Herdr tab named `dev server` for the development server. Do not start background servers. Make verified atomic Conventional Commits; stage explicit paths and do not push unless requested.
