# Deployment and version management

## Environments

| Environment                    | Origin                     | Runtime                                   |
| ------------------------------ | -------------------------- | ----------------------------------------- |
| Local development              | https://linie.dev.hexly.ai | Caddy → 127.0.0.1:7064 → Vite + workerd   |
| Isolated browser-test endpoint | http://127.0.0.1:7064      | The running local dev server              |
| Production                     | https://linie.hexly.ai     | Cloudflare Worker `linie` + static assets |

Ports 17064 (E2E) and 27064 (BDD) are reserved for future isolated servers; the current browser tests use the running development server and do not start a background process. The 7064 allocation was checked against the active and versioned Caddyfiles and by binding all three ports. The nmem registry was unavailable in this session; the allocation is recorded in the two Caddyfiles and this repository instead.

## Local HTTPS

The active machine configuration is `/opt/homebrew/etc/Caddyfile`; the tracked source copy is `~/workspace/personal/workflow/caddy/Caddyfile`. Both contain the Linie mapping. The existing `*.dev.hexly.ai` DNS record resolves to loopback, and the existing trusted mkcert wildcard covers this host. No new certificate, CA installation, Keychain change or hosts-file edit is needed.

The site allows loopback clients only. Caddy redirects HTTP to HTTPS and proxies to the Vite server with the original host. Vite explicitly permits `linie.dev.hexly.ai`. Preserve unrelated Caddy sites and machine-specific settings when editing either file. Validate the active file and reload rather than restarting unrelated services.

```sh
npm run dev
```

Run this in the project's Herdr `dev server` tab. Open the HTTPS domain for manual acceptance. Automated loopback tests remain supported:

```sh
npm run test:e2e
NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" \
  PLAYWRIGHT_BASE_URL=https://linie.dev.hexly.ai npm run test:e2e
```

Chrome already trusts the machine's mkcert CA. Playwright's Node-based request client needs the explicit public CA file for local HTTPS API checks. This command only reads that existing CA certificate; it does not change trust stores or disable TLS verification.

## Cloudflare

`cloudflare.config.ts` is the deployment configuration. The Worker entrypoint is `worker/index.ts`; the Vite plugin builds the React assets and Worker together. The project uses `cf`, not a Wrangler configuration or a hand-built upload format.

The installed `cf` and Cloudflare Vite plugin currently use Cloudflare's documented beta configuration format. Exact versions are pinned in `package-lock.json`. Use a Node release supported by the manifest (22.23+, 24.22+ or 26.12+ within the declared version ranges).

```sh
npm run check
npm run build
npm run deploy:dry-run
npm run test:e2e
npm run deploy
```

`npm run deploy` repeats static/coverage checks, builds and deploys the exact prebuilt production output. It needs the already authenticated Cloudflare CLI profile; do not copy credentials into the repository. No database, KV namespace, AI binding, secret or remote development binding is provisioned. The custom domain is declared in configuration. Workers.dev and preview URLs are disabled.

Build output lives in `.cloudflare/output/v0/`. Vite's Worker-aware preview is available through `npm run preview`; do not serve the old `dist/` directory.

Verify the production origin and `/api/live` separately after deployment. A successful local build or upload is not proof that custom-domain DNS, TLS and routing have completed. Record the Worker version ID and source commit in the deployment log after verification. There is no GitHub CI/deployment workflow in this template yet; do not claim remote CI passed.

## Health contract

`GET /api/live` returns anonymous JSON:

```json
{
  "status": "ok",
  "service": "linie",
  "version": "0.2.0",
  "scope": "worker-liveness",
  "dataMode": "simulation"
}
```

`version` is imported from `package.json`, not maintained independently. The example above represents v0.2.0. Responses carry `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. HEAD has the same status and headers without a body; unsupported methods return 405 with `Allow: GET, HEAD`. Unknown `/api/*` paths return JSON 404 rather than the SPA shell.

The endpoint proves that this Worker revision can respond. It does not claim a database check, a live AI service or healthy infrastructure behind the simulated atlas. Confirm asset delivery with a separate homepage/browser check.

## Version lifecycle

Root `package.json` is the authoritative X.Y.Z. npm synchronizes the root lockfile version. The sidebar and drawing footer display `vX.Y.Z`; `/api/live` returns raw X.Y.Z from the same manifest.

For a future version change:

1. Choose the increment under the maintained versioning skill and identify the previous baseline.
2. Run `npm version patch --no-git-tag-version` (or `minor` / `major` as appropriate).
3. Update `CHANGELOG.md`, run checks and browser acceptance, and make an atomic commit.
4. Build and deploy that committed state through `cf` when publication is authorized.
5. Verify the public health response and visible UI version match the manifest.

These commands do not push Git, create a tag or publish a GitHub Release. Those are separate explicitly authorized actions.
